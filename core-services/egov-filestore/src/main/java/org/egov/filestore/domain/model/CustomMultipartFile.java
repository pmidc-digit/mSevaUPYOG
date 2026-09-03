package org.egov.filestore.domain.model;

import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
/**
 * Custom Java 8 compatible implementation of Spring's MultipartFile interface.
 */
public class CustomMultipartFile implements MultipartFile {
    private final String name;
    private final String originalFilename;
    private final String contentType;
    private final byte[] content;
    public CustomMultipartFile(String name, String originalFilename, String contentType, byte[] content) {
        this.name = name != null ? name : "file";
        this.originalFilename = originalFilename != null ? originalFilename : "file";
        this.contentType = contentType != null ? contentType : "application/octet-stream";
        this.content = content != null ? content : new byte[0];
    }
    @Override
    public String getName() {
        return name;
    }
    @Override
    public String getOriginalFilename() {
        return originalFilename;
    }
    @Override
    public String getContentType() {
        return contentType;
    }
    @Override
    public boolean isEmpty() {
        return content.length == 0;
    }
    @Override
    public long getSize() {
        return content.length;
    }
    @Override
    public byte[] getBytes() throws IOException {
        return content;
    }
    @Override
    public InputStream getInputStream() throws IOException {
        return new ByteArrayInputStream(content);
    }
    @Override
    public void transferTo(File dest) throws IOException, IllegalStateException {
        try (FileOutputStream fos = new FileOutputStream(dest)) {
            fos.write(content);
        }
    }
}