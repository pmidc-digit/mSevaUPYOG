package com.api.internship.services;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.jasypt.util.text.AES256TextEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.api.internship.constants.GlobalEnumConstants.Roles;
import com.api.internship.constants.StatusDto;
import com.api.internship.dtos.ApiResponse2;
import com.api.internship.models.UserMst;
import com.api.internship.repositories.UserMstRepo;

import io.minio.BucketExistsArgs;
import io.minio.CopyObjectArgs;
import io.minio.CopySource;
import io.minio.GetObjectArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.InsufficientDataException;
import io.minio.errors.InternalException;
import io.minio.errors.InvalidResponseException;
import io.minio.errors.ServerException;
import io.minio.errors.XmlParserException;

@Service
public class MinioService {


	private final MinioClient minioClient;
	
	

	@Value("${minio.bucketName}")
	private String bucketName;
	
	@Autowired 
	UserMstRepo userMstRepo;
	
	@Autowired
	ExcelService excelService;

	private static final long maxFileSize = 200 * 1024;
	private static final long maxBulkUploadStudentSize  = 10 * 1024 * 1024;

	private static String hashPassword = "Shree";

	AES256TextEncryptor aesEncryptor = new AES256TextEncryptor();

	public MinioService(MinioClient minioClient) {
		this.minioClient = minioClient;
		aesEncryptor.setPassword(hashPassword);
	}
	
	public String decryptUrl(String encryptPath) {
		return aesEncryptor.decrypt(encryptPath);
	}
	
	public String getBase64(String encryptPath) {
		try {
			if(encryptPath.equals("The specified key does not exist.")) {
				return "Error";
			}
			String realFile=  aesEncryptor.decrypt(encryptPath);
			InputStream inputStream = minioClient.getObject(GetObjectArgs.builder().bucket(bucketName)
					.object(realFile).build());
			String mimeType = minioClient.statObject( StatObjectArgs.builder() .bucket(bucketName) .object( realFile).build() ).contentType();  
			byte [] fileBytes = inputStream.readAllBytes();
			String base64 = Base64.getEncoder().encodeToString(fileBytes);
			return "data:"+mimeType+";"+"base64"+","+base64;
		}
		catch (Exception e) {
			e.printStackTrace();
			return "Error";
		}
		
		
	}

	public ApiResponse2<Object>  uploadFileName(List<MultipartFile> uploadfiles){
		try {
			HashMap<String, String> res = new HashMap<>();
			for(MultipartFile file : uploadfiles) {
				if(file.getSize() > maxFileSize) {
					return new ApiResponse2<>(false, "File size should not exceed 200 KB", null,
							HttpStatus.BAD_REQUEST.value());
				}
				boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
				if(!found) {
					minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
				}
				long currentTime = System.currentTimeMillis();
				String fileName = currentTime+"_"+file.getOriginalFilename();
				minioClient.putObject(PutObjectArgs.builder().bucket(bucketName).object(fileName)
						.stream(file.getInputStream(), file.getSize(), -1)
						.contentType(file.getContentType())
						.build());
				res.put(fileName,aesEncryptor.encrypt( fileName));


			}
			return new ApiResponse2<>(true, StatusDto.uploaded, res, HttpStatus.OK.value());

		}
		catch(Exception e) {
			e.printStackTrace();
			return new ApiResponse2<>(false, StatusDto.internalServerError, null, HttpStatus.OK.value());
		}
	}

	public InputStream getFile(String fileName) {
		try {
			return minioClient.getObject(GetObjectArgs.builder().bucket(bucketName).object(fileName).build());
		}
		catch(Exception e) {
			throw new RuntimeException("Error fetching file" +fileName);
		}

	}


	public String uploadOnRealPath(String decryuptFileName,  String indNo) throws FileNotFoundException {
		try {
			String realFile = "";
			try {
				 realFile = aesEncryptor.decrypt(decryuptFileName);
			}
			catch(Exception e) {
				return "error";
			}
			String objName = "docs/"+indNo +"/"+realFile;
			minioClient.copyObject( CopyObjectArgs.builder() 
					.bucket(bucketName) 
					.object(objName) 
					.source(CopySource.builder() 
							.bucket(bucketName) 
							.object(realFile) .build()) .build() ); 
			
			
			minioClient.removeObject( RemoveObjectArgs.builder() 
					.bucket(bucketName) 
					.object(realFile) .build() ); 
			
			return aesEncryptor.encrypt(objName);

		} catch (Exception e) {
			System.out.println("exception " + e);
			return e.getMessage();
		}
		
	}

	public ApiResponse2<Object> uploadStudents(MultipartFile file, String extractedEmail) throws InvalidKeyException, ErrorResponseException, InsufficientDataException, InternalException, InvalidResponseException, NoSuchAlgorithmException, ServerException, XmlParserException, IllegalArgumentException, IOException {
		Optional<UserMst> user = userMstRepo.findById(Integer.valueOf(extractedEmail));
		if(!user.isPresent()) {
			return new ApiResponse2<>(false, StatusDto.noUser, null, HttpStatus.OK.value());
		}
		if(user.get().getRole().getRoleId() != Roles.Institute.getCode()) {
			return new ApiResponse2<>(false, StatusDto.unAuthorised, null, HttpStatus.UNAUTHORIZED.value());
		}
		if(file.getSize() > maxBulkUploadStudentSize) {
			return new ApiResponse2<>(false, "File size should not exceed 10 MB", null,
					HttpStatus.BAD_REQUEST.value());
		}
		if(!isValidExcelFile(file)) {
			return new ApiResponse2<>(false, StatusDto.invalidExcelFile, null, HttpStatus.BAD_REQUEST.value());
		}
//		boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
//		if(!found) {
//			minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
//		}
//		long currentTime = System.currentTimeMillis();
//		String fileName = currentTime+"_"+file.getOriginalFilename();
//		String objName = "studentUpload/" +fileName;
//		minioClient.putObject(PutObjectArgs.builder().bucket(bucketName).object(objName)
//				.stream(file.getInputStream(), file.getSize(), -1)
//				.contentType(file.getContentType())
//				.build());
		return excelService.uploadStudents(file.getInputStream(), user.get());
		
	}
	
	
	private boolean isValidExcelFile(MultipartFile file) {
		if(file.isEmpty()) {
			return false;
		}
		String fileName = file.getOriginalFilename();
		if(!isExcelFileByExtenshion(fileName)) {
			return false;
		}
		return isExcelFileByContent(file);
	}

	private boolean isExcelFileByExtenshion(String fileName) {
		return fileName != null && (fileName.endsWith(".xls") || fileName.endsWith(".xlsx"));
	}
	
	private boolean isExcelFileByContent(MultipartFile file) {
		try(Workbook workbook = WorkbookFactory.create(file.getInputStream())){
			return true;
		}
		catch (Exception e) {
			return false;
		}
	}
}


