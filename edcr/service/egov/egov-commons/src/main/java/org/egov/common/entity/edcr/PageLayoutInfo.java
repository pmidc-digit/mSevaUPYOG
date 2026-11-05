package org.egov.common.entity.edcr;

public class PageLayoutInfo {
    private String paperSize;
    private Integer drawingScale;
    private int pageOrder;
    private boolean hasBounds;
    private double minX, minY, maxX, maxY;

    public PageLayoutInfo() {}
    public PageLayoutInfo(String paperSize, Integer drawingScale) {
        this.paperSize = paperSize; this.drawingScale = drawingScale;
    }
    public void setBounds(double minX, double minY, double maxX, double maxY) {
        this.minX = minX; this.minY = minY; this.maxX = maxX; this.maxY = maxY; this.hasBounds = true;
    }
    public String getPaperSize() { return paperSize; }
    public void setPaperSize(String v) { paperSize = v; }
    public Integer getDrawingScale() { return drawingScale; }
    public void setDrawingScale(Integer v) { drawingScale = v; }
    public int getPageOrder() { return pageOrder; }
    public void setPageOrder(int v) { pageOrder = v; }
    public boolean isHasBounds() { return hasBounds; }
    public void setHasBounds(boolean v) { hasBounds = v; }
    public double getMinX() { return minX; }  public void setMinX(double v) { minX = v; }
    public double getMinY() { return minY; }  public void setMinY(double v) { minY = v; }
    public double getMaxX() { return maxX; }  public void setMaxX(double v) { maxX = v; }
    public double getMaxY() { return maxY; }  public void setMaxY(double v) { maxY = v; }
}
