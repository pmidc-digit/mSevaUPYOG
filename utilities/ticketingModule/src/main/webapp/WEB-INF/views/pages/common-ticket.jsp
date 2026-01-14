  	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
  	
  	<section id="main-content">
	<section class="wrapper">
	 <div id="loading" style="display:none;">
  <img id="loading-image" src="/ticket/static/images/loader.gif" alt="Loading..." />
</div>
  <section class="panel" id="cmnTktSec">
                        <header class="panel-heading">
                           SELECT YOUR PROJECT
                        </header>
                        <div class="panel-body">
                            <div class="position-center">
                                <form role="form">
                                <div class="form-group">
                                    <label class="col-md-3">Select Project</label>
                                   <select class=" col-md-9" name="project" id="projectIdForTicket" style="height: 6%;">
                                   <option value="0">Select Project</option>
											     <c:forEach items="${projectList}"  var="project">
											         <option value="${project.project_id}">${project.project_name}</option>
											     </c:forEach>
                                   </select>
                                   
                                </div>
                            </form>
                            </div>
                        </div>
                    </section>
                    
                      <div class="col-sm-12 mail-w3agile" id="table-div"></div>
                  
                    </section>
                    </section>
                    
      