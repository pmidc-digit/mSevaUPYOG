package com.search.pmidc.bean;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "bathinda_boundary")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class BathindaBoundaryBean implements Serializable{
	
	private static final long serialVersionUID = 1L;
	
	@Id
	@Column(name = "code")
	private String code;
	
	@Column(name = "colony")
	private String colony;
	
	@Column(name = "sector")
	private String sector;
	
	@Column(name = "area")
	private String area;
	
	@Column(name = "colony_processed")
	private String colony_processed;

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getColony() {
		return colony;
	}

	public void setColony(String colony) {
		this.colony = colony;
	}

	public String getSector() {
		return sector;
	}

	public void setSector(String sector) {
		this.sector = sector;
	}

	public String getArea() {
		return area;
	}

	public void setArea(String area) {
		this.area = area;
	}

	public String getColony_processed() {
		return colony_processed;
	}

	public void setColony_processed(String colony_processed) {
		this.colony_processed = colony_processed;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((area == null) ? 0 : area.hashCode());
		result = prime * result + ((code == null) ? 0 : code.hashCode());
		result = prime * result + ((colony == null) ? 0 : colony.hashCode());
		result = prime * result + ((colony_processed == null) ? 0 : colony_processed.hashCode());
		result = prime * result + ((sector == null) ? 0 : sector.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		BathindaBoundaryBean other = (BathindaBoundaryBean) obj;
		if (area == null) {
			if (other.area != null)
				return false;
		} else if (!area.equals(other.area))
			return false;
		if (code == null) {
			if (other.code != null)
				return false;
		} else if (!code.equals(other.code))
			return false;
		if (colony == null) {
			if (other.colony != null)
				return false;
		} else if (!colony.equals(other.colony))
			return false;
		if (colony_processed == null) {
			if (other.colony_processed != null)
				return false;
		} else if (!colony_processed.equals(other.colony_processed))
			return false;
		if (sector == null) {
			if (other.sector != null)
				return false;
		} else if (!sector.equals(other.sector))
			return false;
		return true;
	}

	@Override
	public String toString() {
		return "BathindaBoundaryBean [code=" + code + ", colony=" + colony + ", sector=" + sector + ", area=" + area
				+ ", colony_processed=" + colony_processed + "]";
	}
	
	
	

}
