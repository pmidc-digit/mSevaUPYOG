package org.egov;

import java.nio.file.*;
import java.io.IOException;
import java.util.*;
import java.util.regex.*;
import java.util.stream.*;

public class MigrateFilters {
    public static void main(String[] args) throws IOException {
        Path start = Paths.get("src/main/java/org/egov/filters");
        Files.walk(start)
            .filter(Files::isRegularFile)
            .filter(p -> p.toString().endsWith(".java"))
            .forEach(MigrateFilters::processFile);
            
        // Also process CustomRateLimitUtils to comment it out or adapt it, but let's just do it manually later
    }
    
    static void processFile(Path path) {
        try {
            String content = new String(Files.readAllBytes(path));
            if (!content.contains("extends ZuulFilter")) {
                return;
            }
            
            // 1. Change imports
            content = content.replaceAll("import com\\.netflix\\.zuul\\.[^;]+;", "");
            content = content.replaceAll("import org\\.springframework\\.cloud\\.netflix\\.zuul\\.[^;]+;", "");
            if (!content.contains("import jakarta.servlet.")) {
                content = content.replaceFirst("import ", "import jakarta.servlet.*;\nimport java.io.IOException;\nimport ");
            }
            if (!content.contains("import org.springframework.core.annotation.Order;")) {
                content = content.replaceFirst("import ", "import org.springframework.core.annotation.Order;\nimport ");
            }
            if (!content.contains("import org.springframework.stereotype.Component;")) {
                content = content.replaceFirst("import ", "import org.springframework.stereotype.Component;\nimport ");
            }
            
            // 2. Class definition
            content = content.replaceAll("extends ZuulFilter", "implements Filter");
            
            // 3. Remove filterType, filterOrder, shouldFilter
            content = content.replaceAll("@Override\\s+public String filterType\\(\\)\\s*\\{[^}]+\\}", "");
            
            // Extract filter order if exists to add @Order annotation
            Matcher orderMatcher = Pattern.compile("public int filterOrder\\(\\)\\s*\\{\\s*return\\s+([^;]+);\\s*\\}").matcher(content);
            String orderVal = "0";
            if (orderMatcher.find()) {
                orderVal = orderMatcher.group(1);
            }
            content = content.replaceAll("@Override\\s+public int filterOrder\\(\\)\\s*\\{[^}]+\\}", "");
            
            // Add @Order and @Component if not present
            if (!content.contains("@Component")) {
                content = content.replaceFirst("public class ", "@Component\n@Order(" + orderVal + ")\npublic class ");
            }
            
            // 4. Transform shouldFilter -> part of doFilter
            // Wait, we can't easily parse the method body. 
            // We can just keep shouldFilter as a private method if it exists!
            content = content.replaceAll("@Override\\s+public boolean shouldFilter\\(\\)", "private boolean shouldFilter(jakarta.servlet.http.HttpServletRequest request)");
            // Replace RequestContext in shouldFilter
            
            // 5. Transform run() -> doFilter()
            content = content.replaceAll("@Override\\s+public Object run\\(\\)(?: throws [^{]+)?\\s*\\{", 
                "@Override\n    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {\n        jakarta.servlet.http.HttpServletRequest request = (jakarta.servlet.http.HttpServletRequest) req;\n        jakarta.servlet.http.HttpServletResponse response = (jakarta.servlet.http.HttpServletResponse) res;\n        if(!shouldFilter(request)) { chain.doFilter(req, res); return; }\n");
            
            // 6. RequestContext to request/response
            content = content.replaceAll("RequestContext\\s+\\w+\\s*=\\s*RequestContext\\.getCurrentContext\\(\\);", "");
            content = content.replaceAll("RequestContext\\.getCurrentContext\\(\\)\\.getRequest\\(\\)", "request");
            content = content.replaceAll("RequestContext\\.getCurrentContext\\(\\)\\.getResponse\\(\\)", "response");
            content = content.replaceAll("RequestContext\\.getCurrentContext\\(\\)\\.setSendZuulResponse\\(false\\);", "");
            content = content.replaceAll("RequestContext\\.getCurrentContext\\(\\)", "request"); // Fallback, we'll fix compile errors manually
            
            // Fix return null at the end of run()
            content = content.replaceAll("return null;\\s*\\}", "chain.doFilter(req, res);\n    }");
            
            Files.write(path, content.getBytes());
            System.out.println("Migrated " + path);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
