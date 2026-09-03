package org.egov.infra.filestore.service.impl;

import org.egov.infra.microservice.models.CustomMultipartFile;
import org.slf4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import static org.slf4j.LoggerFactory.getLogger;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;
/**
 * Service implementation for MultipartFile ZIP compression and decompression.
 * Fully compatible with Java 8 & Spring Boot.
 */
@Service
public class CompressionService{
    private static final int BUFFER_SIZE = 8192;
    
    private static final Logger log = getLogger(EgovMicroServiceStore.class);
    
    public MultipartFile compressToZip(MultipartFile multipartFile) throws IOException {
        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new IllegalArgumentException("MultipartFile must not be null or empty");
        }
        String originalFilename = multipartFile.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            originalFilename = "file.bin";
        }
        String zipFilename = originalFilename.endsWith(".zip") ? originalFilename : originalFilename + ".zip";
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos);
             InputStream is = multipartFile.getInputStream()) {
            ZipEntry entry = new ZipEntry(originalFilename);
            zos.putNextEntry(entry);
            byte[] buffer = new byte[BUFFER_SIZE];
            int bytesRead;
            while ((bytesRead = is.read(buffer)) != -1) {
                zos.write(buffer, 0, bytesRead);
            }
            zos.closeEntry();
            zos.finish();
            zos.flush();
        }
        log.debug("Successfully compressed MultipartFile '{}' into ZIP MultipartFile '{}'", originalFilename, zipFilename);
        return new CustomMultipartFile(
                multipartFile.getName(),
                zipFilename,
                "application/zip",
                baos.toByteArray()
        );
    }
    
    public MultipartFile decompressFromZip(MultipartFile zipMultipartFile) throws IOException {
        if (zipMultipartFile == null || zipMultipartFile.isEmpty()) {
            throw new IllegalArgumentException("ZIP MultipartFile must not be null or empty");
        }
        try (InputStream is = zipMultipartFile.getInputStream();
             BufferedInputStream bis = new BufferedInputStream(is)) {
            // Validate ZIP header bytes (PK\003\004 -> 0x50 0x4B 0x03 0x04)
            bis.mark(4);
            byte[] header = new byte[4];
            int headerRead = bis.read(header);
            bis.reset();
            if (headerRead < 4 || header[0] != 0x50 || header[1] != 0x4B || header[2] != 0x03 || header[3] != 0x04) {
                throw new IOException("Provided MultipartFile is not a valid ZIP archive (missing PK magic header).");
            }
            try (ZipInputStream zis = new ZipInputStream(bis)) {
                ZipEntry entry = zis.getNextEntry();
                if (entry == null) {
                    throw new IOException("ZIP archive contains no entries");
                }
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                byte[] buffer = new byte[BUFFER_SIZE];
                int bytesRead;
                while ((bytesRead = zis.read(buffer)) != -1) {
                    baos.write(buffer, 0, bytesRead);
                }
                zis.closeEntry();
                String extractedFilename = entry.getName();
                log.debug("Decompressed first entry '{}' from ZIP MultipartFile", extractedFilename);
                return new CustomMultipartFile(
                        zipMultipartFile.getName(),
                        extractedFilename,
                        "application/octet-stream",
                        baos.toByteArray()
                );
            }
        }
    }
    
    public InputStream decompressFromZip(InputStream inputStream) throws IOException {
        if (inputStream == null) {
            throw new IllegalArgumentException("ZIP InputStream must not be null");
        }
        try (InputStream is = inputStream;
             BufferedInputStream bis = new BufferedInputStream(is)) {
            // Validate ZIP header bytes (PK\003\004 -> 0x50 0x4B 0x03 0x04)
            bis.mark(4);
            byte[] header = new byte[4];
            int headerRead = bis.read(header);
            bis.reset();
            if (headerRead < 4 || header[0] != 0x50 || header[1] != 0x4B || header[2] != 0x03 || header[3] != 0x04) {
                throw new IOException("Provided MultipartFile is not a valid ZIP archive (missing PK magic header).");
            }
            try (ZipInputStream zis = new ZipInputStream(bis)) {
                ZipEntry entry = zis.getNextEntry();
                if (entry == null) {
                    throw new IOException("ZIP archive contains no entries");
                }
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                byte[] buffer = new byte[BUFFER_SIZE];
                int bytesRead;
                while ((bytesRead = zis.read(buffer)) != -1) {
                    baos.write(buffer, 0, bytesRead);
                }
                zis.closeEntry();
                String extractedFilename = entry.getName();
                log.debug("Decompressed first entry '{}' from ZIP MultipartFile", extractedFilename);
                return new ByteArrayInputStream(baos.toByteArray());
            }
        }
    }
    
    public MultipartFile decompressFromZip(MultipartFile zipMultipartFile, String targetFileName) throws IOException {
        if (zipMultipartFile == null || zipMultipartFile.isEmpty() || targetFileName == null || targetFileName.trim().isEmpty()) {
            throw new IllegalArgumentException("ZIP MultipartFile and targetFileName must not be null or empty");
        }
        try (InputStream is = zipMultipartFile.getInputStream();
             ZipInputStream zis = new ZipInputStream(is)) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.getName().equals(targetFileName)) {
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    byte[] buffer = new byte[BUFFER_SIZE];
                    int bytesRead;
                    while ((bytesRead = zis.read(buffer)) != -1) {
                        baos.write(buffer, 0, bytesRead);
                    }
                    zis.closeEntry();
                    log.debug("Extracted target entry '{}' from ZIP MultipartFile", targetFileName);
                    return new CustomMultipartFile(
                            zipMultipartFile.getName(),
                            entry.getName(),
                            "application/octet-stream",
                            baos.toByteArray()
                    );
                }
            }
            throw new FileNotFoundException("Entry '" + targetFileName + "' not found in ZIP archive");
        }
    }
}
