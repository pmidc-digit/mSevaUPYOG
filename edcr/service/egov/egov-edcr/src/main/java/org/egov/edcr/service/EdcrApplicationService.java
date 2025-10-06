package org.egov.edcr.service;

import static org.egov.edcr.utility.DcrConstants.FILESTORE_MODULECODE;

import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.file.FileSystemException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.pdfbox.io.RandomAccessBufferedFileInputStream;
import org.apache.pdfbox.io.RandomAccessRead;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentCatalog;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.PDPageTree;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.state.PDExtendedGraphicsState;
import org.apache.pdfbox.pdmodel.interactive.documentnavigation.destination.PDPageXYZDestination;
import org.egov.common.entity.edcr.Plan;
//import org.egov.edcr.contract.EdcrRequest;
import org.egov.common.edcr.model.EdcrRequest;
import org.egov.edcr.entity.ApplicationType;
import org.egov.edcr.entity.EdcrApplication;
import org.egov.edcr.entity.EdcrApplicationDetail;
import org.egov.edcr.entity.SearchBuildingPlanScrutinyForm;
import org.egov.edcr.repository.EdcrApplicationDetailRepository;
import org.egov.edcr.repository.EdcrApplicationRepository;
import org.egov.edcr.service.es.EdcrIndexService;
import org.egov.infra.config.persistence.datasource.routing.annotation.ReadOnly;
import org.egov.infra.filestore.entity.FileStoreMapper;
import org.egov.infra.filestore.service.FileStoreService;
import org.egov.infra.security.utils.SecurityUtils;
import org.egov.infra.utils.ApplicationNumberGenerator;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.aspose.cad.Color;
import com.aspose.cad.Image;
import com.aspose.cad.fileformats.cad.CadDrawTypeMode;
import com.aspose.cad.imageoptions.CadRasterizationOptions;
import com.aspose.cad.imageoptions.PdfOptions;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.io.RandomAccessBufferedFileInputStream;

import java.io.File;
import java.io.IOException;

//import com.aspose.cad.Color;
//import com.aspose.cad.Image;
//import com.aspose.cad.fileformats.cad.CadDrawTypeMode;
//import com.aspose.cad.imageoptions.CadRasterizationOptions;
//import com.aspose.cad.imageoptions.PdfOptions;

@Service
@Transactional(readOnly = true)
public class EdcrApplicationService {
    private static final String RESUBMIT_SCRTNY = "Resubmit Plan Scrutiny";
    private static final String NEW_SCRTNY = "New Plan Scrutiny";
    public static final String ULB_NAME = "ulbName";
    public static final String ABORTED = "Aborted";
    private static Logger LOG = LogManager.getLogger(EdcrApplicationService.class);
    
    
    //private static final PDFont TIMESTAMP_FONT = PDType1Font.HELVETICA_BOLD;
    private static final DateTimeFormatter TS_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    @Autowired
    protected SecurityUtils securityUtils;

    @Autowired
    private EdcrApplicationRepository edcrApplicationRepository;

    @Autowired
    private EdcrApplicationDetailRepository edcrApplicationDetailRepository;

    @Autowired
    private PlanService planService;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private FileStoreService fileStoreService;

    @Autowired
    private ApplicationNumberGenerator applicationNumberGenerator;

    @Autowired
    private EdcrIndexService edcrIndexService;

    @Autowired
    private EdcrApplicationDetailService edcrApplicationDetailService;

    public Session getCurrentSession() {
        return entityManager.unwrap(Session.class);
    }

    @Transactional
    public EdcrApplication create(final EdcrApplication edcrApplication) {

        // edcrApplication.setApplicationDate(new Date("01/01/2020"));
        edcrApplication.setApplicationDate(new Date());
        edcrApplication.setApplicationNumber(applicationNumberGenerator.generate());
        edcrApplication.setSavedDxfFile(saveDXF(edcrApplication));
        edcrApplication.setStatus(ABORTED);

        edcrApplicationRepository.save(edcrApplication);

        edcrIndexService.updateIndexes(edcrApplication, NEW_SCRTNY);

        callDcrProcess(edcrApplication, NEW_SCRTNY);
        edcrIndexService.updateIndexes(edcrApplication, NEW_SCRTNY);

        return edcrApplication;
    }

    @Transactional
    public EdcrApplication update(final EdcrApplication edcrApplication) {
        edcrApplication.setSavedDxfFile(saveDXF(edcrApplication));
        edcrApplication.setStatus(ABORTED);
        Plan unsavedPlanDetail = edcrApplication.getEdcrApplicationDetails().get(0).getPlan();
        EdcrApplication applicationRes = edcrApplicationRepository.save(edcrApplication);
        edcrApplication.getEdcrApplicationDetails().get(0).setPlan(unsavedPlanDetail);

        edcrIndexService.updateIndexes(edcrApplication, RESUBMIT_SCRTNY);

        callDcrProcess(edcrApplication, RESUBMIT_SCRTNY);

        return applicationRes;
    }

    private Plan callDcrProcess(EdcrApplication edcrApplication, String applicationType, EdcrRequest edcrRequest){
        Plan planDetail = new Plan();
        planDetail = planService.process(edcrApplication, applicationType, edcrRequest);
        updateFile(planDetail, edcrApplication);
        edcrApplicationDetailService.saveAll(edcrApplication.getEdcrApplicationDetails());
        return planDetail;
    }
    
    private Plan callDcrProcess(EdcrApplication edcrApplication, String applicationType){
        Plan planDetail = new Plan();
        planDetail = planService.process(edcrApplication, applicationType);
        updateFile(planDetail, edcrApplication);
        edcrApplicationDetailService.saveAll(edcrApplication.getEdcrApplicationDetails());
        return planDetail;
    }

    private File saveDXF(EdcrApplication edcrApplication) {
        FileStoreMapper fileStoreMapper = addToFileStore(edcrApplication.getDxfFile());
        File dxfFile = fileStoreService.fetch(fileStoreMapper.getFileStoreId(), FILESTORE_MODULECODE);
        planService.buildDocuments(edcrApplication, fileStoreMapper, null, null);
        List<EdcrApplicationDetail> edcrApplicationDetails = edcrApplication.getEdcrApplicationDetails();
        edcrApplicationDetails.get(0).setStatus(ABORTED);
        edcrApplication.setEdcrApplicationDetails(edcrApplicationDetails);
        return dxfFile;

    }

    public File savePlanDXF(final MultipartFile file) {
        FileStoreMapper fileStoreMapper = addToFileStore(file);
        return fileStoreService.fetch(fileStoreMapper.getFileStoreId(), FILESTORE_MODULECODE);
    }

    private FileStoreMapper addToFileStore(final MultipartFile file) {
        FileStoreMapper fileStoreMapper = null;
        try {
            fileStoreMapper = fileStoreService.store(file.getInputStream(), file.getOriginalFilename(),
                    file.getContentType(), FILESTORE_MODULECODE);
        } catch (final IOException e) {
            LOG.error("Error occurred, while getting input stream!!!!!", e);
        }
        return fileStoreMapper;
    }

    public List<EdcrApplication> findAll() {
        return edcrApplicationRepository.findAll(new Sort(Sort.Direction.ASC, "name"));
    }

    public EdcrApplication findOne(Long id) {
        return edcrApplicationRepository.findOne(id);
    }

    public EdcrApplication findByApplicationNo(String appNo) {
        return edcrApplicationRepository.findByApplicationNumber(appNo);
    }

    public EdcrApplication findByApplicationNoAndType(String applnNo, ApplicationType type) {
        return edcrApplicationRepository.findByApplicationNumberAndApplicationType(applnNo, type);
    }

    public EdcrApplication findByPlanPermitNumber(String permitNo) {
        return edcrApplicationRepository.findByPlanPermitNumber(permitNo);
    }

    public EdcrApplication findByTransactionNumber(String transactionNo) {
        return edcrApplicationRepository.findByTransactionNumber(transactionNo);
    }

    public EdcrApplication findByTransactionNumberAndTPUserCode(String transactionNo, String userCode) {
        return edcrApplicationRepository.findByTransactionNumberAndThirdPartyUserCode(transactionNo, userCode);
    }

    public List<EdcrApplication> search(EdcrApplication edcrApplication) {
        return edcrApplicationRepository.findAll();
    }

    public List<EdcrApplication> findByThirdPartyUserCode(String userCode) {
        return edcrApplicationRepository.findByThirdPartyUserCode(userCode);
    }

    public List<EdcrApplication> getEdcrApplications() {
        Pageable pageable = new PageRequest(0, 25, Sort.Direction.DESC, "id");
        Page<EdcrApplication> edcrApplications = edcrApplicationRepository.findAll(pageable);
        return edcrApplications.getContent();
    }

    @ReadOnly
    public Page<SearchBuildingPlanScrutinyForm> planScrutinyPagedSearch(SearchBuildingPlanScrutinyForm searchRequest) {
        final Pageable pageable = new PageRequest(searchRequest.pageNumber(), searchRequest.pageSize(),
                searchRequest.orderDir(), searchRequest.orderBy());
        List<SearchBuildingPlanScrutinyForm> searchResults = new ArrayList<>();
        Page<EdcrApplicationDetail> dcrApplications = edcrApplicationDetailRepository
                .findAll(DcrReportSearchSpec.searchReportsSpecification(searchRequest), pageable);
        for (EdcrApplicationDetail applicationDetail : dcrApplications)
            searchResults.add(buildResponseAsPerForm(applicationDetail));
        return new PageImpl<>(searchResults, pageable, dcrApplications.getTotalElements());
    }

    private SearchBuildingPlanScrutinyForm buildResponseAsPerForm(EdcrApplicationDetail applicationDetail) {
        SearchBuildingPlanScrutinyForm planScrtnyFrm = new SearchBuildingPlanScrutinyForm();
        EdcrApplication application = applicationDetail.getApplication();
        planScrtnyFrm.setApplicationNumber(application.getApplicationNumber());
        planScrtnyFrm.setApplicationDate(application.getApplicationDate());
        planScrtnyFrm.setApplicantName(application.getApplicantName());
        planScrtnyFrm.setBuildingPlanScrutinyNumber(applicationDetail.getDcrNumber());
        planScrtnyFrm.setUploadedDateAndTime(applicationDetail.getCreatedDate());
        if (applicationDetail.getDxfFileId() != null)
            planScrtnyFrm.setDxfFileStoreId(applicationDetail.getDxfFileId().getFileStoreId());
        if (applicationDetail.getDxfFileId() != null)
            planScrtnyFrm.setDxfFileName(applicationDetail.getDxfFileId().getFileName());
        if (applicationDetail.getReportOutputId() != null)
            planScrtnyFrm.setReportOutputFileStoreId(applicationDetail.getReportOutputId().getFileStoreId());
        if (applicationDetail.getReportOutputId() != null)
            planScrtnyFrm.setReportOutputFileName(applicationDetail.getReportOutputId().getFileName());
        planScrtnyFrm.setStakeHolderId(application.getCreatedBy().getId());
        planScrtnyFrm.setStatus(applicationDetail.getStatus());
        planScrtnyFrm.setBuildingLicenceeName(application.getCreatedBy().getName());
        return planScrtnyFrm;
    }

    private static String readFile(File srcFile) {
        String fileAsString = null;
        try {
            String canonicalPath = srcFile.getCanonicalPath();
            if (!canonicalPath.equals(srcFile.getPath()))
                throw new FileNotFoundException("Invalid file path, please try again.");
        } catch (IOException e) {
            LOG.error("Invalid file path, please try again.", e);
        }
        try (InputStream is = new FileInputStream(srcFile);
                BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
            String line = br.readLine();
            StringBuilder sb = new StringBuilder();
            while (line != null) {
                sb.append(line).append("\n");
                line = br.readLine();
            }
            fileAsString = sb.toString();
        } catch (IOException e) {
            LOG.error("Error occurred when reading file!!!!!", e);
        }
        return fileAsString;
    }


//  private void updateFile(Plan pl, EdcrApplication edcrApplication) {
//  String readFile = readFile(edcrApplication.getSavedDxfFile());
//  String replace = readFile.replace("ENTITIES", "ENTITIES\n0\n" + pl.getAdditionsToDxf());
//  String newFile = edcrApplication.getDxfFile().getOriginalFilename().replace(".dxf", "_system_scrutinized.dxf");
//  File f = new File(newFile);
//  try (FileOutputStream fos = new FileOutputStream(f)) {
//      if (!f.exists())
//          f.createNewFile();
//      fos.write(replace.getBytes());
//      fos.flush();
//      FileStoreMapper fileStoreMapper = fileStoreService.store(f, f.getName(),
//              edcrApplication.getDxfFile().getContentType(), FILESTORE_MODULECODE);
//      edcrApplication.getEdcrApplicationDetails().get(0).setScrutinizedDxfFileId(fileStoreMapper);
//  } catch (IOException e) {
//      LOG.error("Error occurred when reading file!!!!!", e);
//  }
//}
    
  

    
//    private void updateFile(Plan pl, EdcrApplication edcrApplication) {
//        String filePath = edcrApplication.getSavedDxfFile().getAbsolutePath();
//        String newFile = edcrApplication.getDxfFile().getOriginalFilename().replace(".dxf", "_system_scrutinized.pdf");
//
//        // Load the source CAD file
//        Image objImage = Image.load(filePath);
//
//        // Create an instance of PdfOptions
//        PdfOptions pdfOptions = new PdfOptions();
//
//        // Create rasterization options and configure scaling
//        CadRasterizationOptions rasterizationOptions = new CadRasterizationOptions();
//        rasterizationOptions.setBackgroundColor(Color.getWhite()); // Set background color if needed
//        rasterizationOptions.setDrawType(CadDrawTypeMode.UseObjectColor); // Ensure object colors are used
//
//        // Set the page size (A0 size in points)
//        rasterizationOptions.setPageWidth(3370); // A0 width in points
//        rasterizationOptions.setPageHeight(2384); // A0 height in points
//
//        // Ensure content fits within the page size
//        rasterizationOptions.setAutomaticLayoutsScaling(true);
//        rasterizationOptions.setNoScaling(false);
//
//        pdfOptions.setVectorRasterizationOptions(rasterizationOptions);
//
//        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
//
//        // Export CAD to PDF
//        objImage.save(outputStream, pdfOptions);
//
//        byte[] pdfBytes = outputStream.toByteArray();
//
//        try (PDDocument document = PDDocument.load(pdfBytes)) {
//            // Get the first page to set the view
//            PDPageTree pages = document.getPages();
//            PDPage page = pages.get(0);
//
//            // Set the destination to center of the page
//            PDPageXYZDestination dest = new PDPageXYZDestination();
//            dest.setPage(page);
//
//            // Calculate the center coordinates
//            float pageWidth = page.getMediaBox().getWidth();
//            float pageHeight = page.getMediaBox().getHeight();
//            int centerX = (int) (pageWidth / 2.0f);
//            int centerY = (int) (pageHeight / 2.0f);
//
//            dest.setLeft(centerX);
//            dest.setTop(centerY);
//            dest.setZoom(1.0f); // Adjust the zoom level if necessary
//
//            // Set the open action
//            PDDocumentCatalog catalog = document.getDocumentCatalog();
//            catalog.setOpenAction(dest);
//
//            byte[] modifiedPdfBytes;
//
//            // Create a new content stream to add the watermark
//            PDPageContentStream contentStream = new PDPageContentStream(document, page,
//                    PDPageContentStream.AppendMode.APPEND, true, true);
//
//            PDExtendedGraphicsState graphicsState = new PDExtendedGraphicsState();
//            graphicsState.setNonStrokingAlphaConstant(0.2f); // Set lower opacity
//            graphicsState.setAlphaSourceFlag(true);
//            contentStream.setGraphicsStateParameters(graphicsState);
//
////            InputStream imageStream = EdcrApplication.class.getResourceAsStream("/tcpicon.jpg");
////            java.awt.image.BufferedImage image1 = ImageIO.read(imageStream);
////            PDImageXObject image = LosslessFactory.createFromImage(document, image1);
////    
////            // Calculate the position to center the watermark
////            float scale = 10f; // Smaller scale for the watermark
////            float watermarkWidth = image.getWidth() * scale;
////            float watermarkHeight = image.getHeight() * scale;
////            float watermarkXPos = (pageWidth - watermarkWidth) / 2; // Center horizontally
////            float watermarkYPos = (pageHeight - watermarkHeight) / 2; // Center vertically
////
////            // Draw the watermark image on the page
////            contentStream.drawImage(image, watermarkXPos, watermarkYPos, watermarkWidth, watermarkHeight);
//
//            // Add timestamp
//            String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
//            contentStream.beginText();
//            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 200);
//
//            // Estimate the width of the timestamp text
//            float textWidth = (PDType1Font.HELVETICA_BOLD.getStringWidth(timestamp) / 1000) * 200;
//
//            // Set the position to bottom right corner
//            float xPos = pageWidth - textWidth - 700; // 700 units margin from the right edge
//            float yPos = 10; // 10 units margin from the bottom edge
//
//            contentStream.newLineAtOffset(xPos, yPos); // Position the timestamp at the bottom right corner
//
//            PDExtendedGraphicsState graphicsState1 = new PDExtendedGraphicsState();
//            graphicsState1.setNonStrokingAlphaConstant(0.7f); // Set text opacity
//            contentStream.setGraphicsStateParameters(graphicsState1);
//
//            contentStream.showText(timestamp);
//            contentStream.endText();
//
//            // Close the content stream
//            contentStream.close();
//
//            // Save the modified PDF
//            ByteArrayOutputStream modifiedPdfStream = new ByteArrayOutputStream();
//            document.save(modifiedPdfStream);
//
//            // Convert the modified PDF to a byte array
//            modifiedPdfBytes = modifiedPdfStream.toByteArray();
//
//            File f = new File(newFile);
//            try (FileOutputStream fos = new FileOutputStream(f)) {
//                if (!f.exists())
//                    f.createNewFile();
//                fos.write(modifiedPdfBytes);
//                fos.flush();
//                FileStoreMapper fileStoreMapper = fileStoreService.store(f, f.getName(),
//                        edcrApplication.getDxfFile().getContentType(), FILESTORE_MODULECODE);
//                edcrApplication.getEdcrApplicationDetails().get(0).setScrutinizedDxfFileId(fileStoreMapper);
//            } catch (IOException e) {
//                LOG.error("Error occurred when reading file!!!!!", e);
//            }
//        } catch (IOException e) {
//            LOG.error("Error occurred when processing PDF!!!!!", e);
//        }
//    }
    


private void updateFile(Plan pl, EdcrApplication edcrApplication) {
    long start = System.currentTimeMillis();
    String filePath = edcrApplication.getSavedDxfFile().getAbsolutePath();
    String newFileName = edcrApplication.getDxfFile().getOriginalFilename()
            .replace(".dxf", "_system_scrutinized.pdf");
    File finalOutputFile = new File(newFileName);

    LOG.info("🔄 Starting scrutinized PDF generation for: {}", newFileName);

    File tempPdf = null;
    try {
        // --- Step 1: Convert DXF → PDF using Aspose CAD ---
        tempPdf = File.createTempFile("scrutinized_", ".pdf");
        LOG.debug("Temporary PDF path: {}", tempPdf.getAbsolutePath());

        try (Image cadImage = Image.load(filePath);
             FileOutputStream tempOut = new FileOutputStream(tempPdf)) {

            PdfOptions pdfOptions = new PdfOptions();
            CadRasterizationOptions rasterOpts = new CadRasterizationOptions();
            rasterOpts.setBackgroundColor(Color.getWhite());
            rasterOpts.setDrawType(CadDrawTypeMode.UseObjectColor);
            rasterOpts.setPageWidth(2480); // ~A4 horizontal, smaller to reduce memory
            rasterOpts.setPageHeight(3508); // ~A4 vertical
            rasterOpts.setAutomaticLayoutsScaling(true);
            rasterOpts.setNoScaling(false);
            pdfOptions.setVectorRasterizationOptions(rasterOpts);

            cadImage.save(tempOut, pdfOptions);
            LOG.debug("✅ CAD to PDF conversion complete.");
        } catch (OutOfMemoryError oom) {
            LOG.error("❌ OutOfMemoryError while converting DXF → PDF: {}", filePath, oom);
            throw oom;
        } catch (Exception ex) {
            LOG.error("❌ Error converting DXF → PDF: {}", filePath, ex);
            throw ex;
        }

        // --- Step 2: Post-process PDF (timestamp, incremental save) ---
        try (RandomAccessBufferedFileInputStream rar = new RandomAccessBufferedFileInputStream(tempPdf);
             PDDocument document = PDDocument.load(rar);
             BufferedOutputStream out = new BufferedOutputStream(new FileOutputStream(finalOutputFile))) {

            PDPage page = document.getPage(0);
            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();

            // Set initial view to center
            PDPageXYZDestination dest = new PDPageXYZDestination();
            dest.setPage(page);
            dest.setLeft((int) (pageWidth / 2f));
            dest.setTop((int) (pageHeight / 2f));
            dest.setZoom(1.0f);
            document.getDocumentCatalog().setOpenAction(dest);

            try (PDPageContentStream contentStream = new PDPageContentStream(
                    document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {

                PDExtendedGraphicsState gs = new PDExtendedGraphicsState();
                gs.setNonStrokingAlphaConstant(0.7f);
                contentStream.setGraphicsStateParameters(gs);

                // --- (COMMENTED WATERMARK IMAGE CODE - preserved) ---
//                InputStream imageStream = EdcrApplication.class.getResourceAsStream("/tcpicon.jpg");
//                java.awt.image.BufferedImage image1 = ImageIO.read(imageStream);
//                PDImageXObject image = LosslessFactory.createFromImage(document, image1);
//                float scale = 10f;
//                float watermarkWidth = image.getWidth() * scale;
//                float watermarkHeight = image.getHeight() * scale;
//                float watermarkXPos = (pageWidth - watermarkWidth) / 2;
//                float watermarkYPos = (pageHeight - watermarkHeight) / 2;
//                contentStream.drawImage(image, watermarkXPos, watermarkYPos, watermarkWidth, watermarkHeight);

                // --- Add timestamp ---
                String timestamp = LocalDateTime.now().format(TS_FORMAT);
                float fontSize = 24f;
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, fontSize);
                float textWidth = (PDType1Font.HELVETICA_BOLD.getStringWidth(timestamp) / 1000f) * fontSize;

                float xPos = Math.max(20, pageWidth - textWidth - 20);
                float yPos = 20f;
                contentStream.beginText();
                contentStream.newLineAtOffset(xPos, yPos);
                contentStream.showText(timestamp);
                contentStream.endText();
            }

            // Incremental save to reduce memory usage
            document.saveIncremental(out);
            LOG.info("✅ PDF timestamp appended incrementally.");

        } catch (Exception pdfEx) {
            LOG.error("❌ Error during PDF post-processing for '{}': {}", newFileName, pdfEx.getMessage(), pdfEx);
            throw pdfEx;
        }

        // --- Step 3: Store to Filestore ---
        try {
            FileStoreMapper fileStoreMapper = fileStoreService.store(
                    finalOutputFile, finalOutputFile.getName(),
                    edcrApplication.getDxfFile().getContentType(), FILESTORE_MODULECODE);

            edcrApplication.getEdcrApplicationDetails()
                    .get(0).setScrutinizedDxfFileId(fileStoreMapper);

            LOG.info("📁 File stored successfully in filestore: {}", 
                    fileStoreMapper != null ? fileStoreMapper.getFileStoreId() : "null");
        } catch (Exception storeEx) {
            LOG.error("❌ Failed to store generated PDF in filestore: {}", storeEx.getMessage(), storeEx);
            throw storeEx;
        }

    } catch (Exception e) {
        LOG.error("🚨 Error in updateFile() for '{}': {}", newFileName, e.getMessage(), e);
    } finally {
        if (tempPdf != null && tempPdf.exists() && !tempPdf.delete()) {
            LOG.warn("⚠️ Temporary PDF not deleted: {}", tempPdf.getAbsolutePath());
        }
        long elapsed = System.currentTimeMillis() - start;
        LOG.info("⚡ updateFile() completed in {} ms → {}", elapsed, newFileName);
    }
}






 // =======================================================
 // ✅ Utility: Safe delete with retry (shared by both methods)
 // =======================================================
 private boolean safeDeleteWithRetry(Path path, int maxRetries, long sleepMillis) {
     for (int attempt = 1; attempt <= maxRetries; attempt++) {
         try {
             if (Files.deleteIfExists(path)) {
                 LOG.debug("✅ Successfully deleted file on attempt {}: {}", attempt, path);
                 return true;
             }
         } catch (FileSystemException fse) {
             LOG.debug("Attempt {} to delete '{}' failed (file locked): {}", attempt, path, fse.getMessage());
         } catch (Exception e) {
             LOG.debug("Attempt {} to delete '{}' failed: {}", attempt, path, e.getMessage());
         }

         // wait and retry
         try {
             Thread.sleep(sleepMillis);
         } catch (InterruptedException ignored) {
             Thread.currentThread().interrupt();
             break;
         }
     }
     LOG.warn("⚠️ Failed to delete file after {} retries: {}", maxRetries, path);
     return false;
 }

    
    

    @Transactional
    public EdcrApplication createRestEdcr(final EdcrApplication edcrApplication, EdcrRequest edcrRequest){
        String comparisonDcrNo = edcrApplication.getEdcrApplicationDetails().get(0).getComparisonDcrNumber();
        if (edcrApplication.getApplicationDate() == null)
            edcrApplication.setApplicationDate(new Date());
        edcrApplication.setApplicationNumber(applicationNumberGenerator.generate());
        edcrApplication.setSavedDxfFile(saveDXF(edcrApplication));
        edcrApplication.setStatus(ABORTED);
        edcrApplicationRepository.save(edcrApplication);
        edcrApplication.getEdcrApplicationDetails().get(0).setComparisonDcrNumber(comparisonDcrNo);
//        callDcrProcess(edcrApplication, NEW_SCRTNY);
        callDcrProcess(edcrApplication, NEW_SCRTNY,edcrRequest);
        edcrIndexService.updateEdcrRestIndexes(edcrApplication, NEW_SCRTNY);
        return edcrApplication;
    }
}
