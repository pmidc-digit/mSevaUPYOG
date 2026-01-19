package com.search.pmidc.bean;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

	@Entity
	@Table(name = "amritsar_boundary")
	@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
	public class AsrBoundaryBean implements Serializable {

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

		public String getColony() {
			return colony;
		}

		public String getSector() {
			return sector;
		}

		public String getArea() {
			return area;
		}

		public String getColony_processed() {
			return colony_processed;
		}

		public void setCode(String code) {
			this.code = code;
		}

		public void setColony(String colony) {
			this.colony = colony;
		}

		public void setSector(String sector) {
			this.sector = sector;
		}

		public void setArea(String area) {
			this.area = area;
		}

		public void setColony_processed(String colony_processed) {
			this.colony_processed = colony_processed;
		}

		@Override
		public String toString() {
			return "AsrBoundaryBean [code=" + code + ", colony=" + colony + ", sector=" + sector + ", area=" + area
					+ ", colony_processed=" + colony_processed + "]";
		}
	}