<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
<%@ page isELIgnored="false"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles"%>

<html>

<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title><tiles:getAsString name="title" /></title>
 <link rel="shortcut icon" href="<c:url value='/static/images/fav-icon.png' />" ></link>
<link href="<c:url value='/static/css/bootstrap.min.css' />"
	rel="stylesheet"></link>
<link href="<c:url value='/static/css/font-awesome.css' />"
	rel="stylesheet"></link>
<link href="<c:url value='/static/css/font.css' />" rel="stylesheet"></link>
<link href="<c:url value='/static/css/jqvmap.css' />" rel="stylesheet"></link>
<link href="<c:url value='/static/css/lightbox.css' />" rel="stylesheet"></link>
<link href="<c:url value='/static/css/minimal.css' />" rel="stylesheet"></link>
<link href="<c:url value='/static/css/monthly.css' />" rel="stylesheet"></link>
<link href="<c:url value='/static/css/morris.css' />" rel="stylesheet"></link>
<link href="<c:url value='/static/css/style.css' />" rel="stylesheet"></link>
<link href="<c:url value='/static/css/style-responsive.css' />"	rel="stylesheet"></link>
<link href="<c:url value='/static/css/dataTable.css' />"	rel="stylesheet"></link>
<link href="<c:url value='/static/css/animate.min.css' />" rel="stylesheet"></link>
<link href="<c:url value='/static/css/modal-style.css' />" rel="stylesheet"></link>

<script src="<c:url value="/static/js/jquery2.0.3.min.js"/>"></script>
<script src="<c:url value="/static/js/raphael-min.js"/>"></script>
<script src="<c:url value="/static/js/morris.js"/>"></script>
<script src="<c:url value="/static/js/bootstrap.js"/>"></script>
<script src="<c:url value="/static/js/jquery.dcjqaccordion.2.7.js"/>"></script>
<script src="<c:url value="/static/js/scripts.js"/>"></script>
<script type="<c:url value="/static/js/jquery.slimscroll.js"/>"></script>
<script src="<c:url value="/static/js/jquery.nicescroll.js"/>"></script>
<script src="<c:url value="/static/js/jquery.scrollTo.js"/>"></script>
<script src="<c:url value="/static/js/data.table.js"/>"></script>
<script src="<c:url value="/static/js/developer.js"/>"></script>


</head>

<body>
	<header id="header">
		<tiles:insertAttribute name="header" />
	</header>

	<section id="sidemenu">
		<tiles:insertAttribute name="menu" />
	</section>

	<section id="site-content">
		<tiles:insertAttribute name="body" />
	</section>

	<footer id="footer">
		<tiles:insertAttribute name="footer" />
	</footer>


	<!-- Log out model -->
	<div class="modal modal-success fade" id="modal-success">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-body">
					<button type="button" class="close" data-dismiss="modal"
						aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
					<center>Are you sure you want to logout?</center>
				</div>

				<div class="modal-footer">
					<center>
						<button type="button" class="btn btn-outline"
							style="background: #53d769">
							<a href="logout" style="color: #fff">Yes</a>
						</button>
						<button type="button" class="btn btn-outline" data-dismiss="modal"
							style="background: #fc3158; color: #fff">No</button>
					</center>
				</div>

			</div>
			<!-- /.modal-content -->
		</div>
		<!-- /.modal-dialog -->
	</div>
	<!-- /.modal -->


<!--*************update ticket status*********************  -->


	<div class="modal modal-success fade" id="update-modal">
		<div class="modal-dialog">
			<div class="modal-content">
			<form method="POST" action="#"  class="cmxform form-horizontal">
			 <section class="panel">
                        <header class="panel-heading">
                            Change Ticket Status OR Priority
                         
                        </header>
                        
				<div class="modal-body">
                            <div class=" form">
					<div class="form-group ">
                                        <label for="cname" class="control-label col-lg-3">Status</label>
                                         <div class="col-lg-9">
                                         <input type="hidden" id="tkt-id"/>
                                          <input type="hidden" id="page-name"/>
                                          <input type="hidden" id="page-no"/>
                                          <input type="hidden" id="location"/>
                                         	<select class=" form-control" name="tktTypeId" id="type-action"></select>
									    </div>
                                    </div>
                                    
				
                                     <div class="form-group "> 
                                        <label for="cname" class="control-label col-lg-3">Priority</label> 
                                          <div class="col-lg-9"> 
                                         	<select class=" form-control" name="tktPriority" id="priority-action"></select> 
									    </div> 
                                    
           </div>
					
					</div>
				</div>
				</section>
				

				<div class="modal-footer">
					<center>
						<button type="button" onclick="updateTicketType()" class="btn btn-outline"
							style="background: #53d769">
							<a  style="color: #fff">Yes</a>
						</button>
						<button type="button" class="btn btn-outline" data-dismiss="modal"
							style="background: #fc3158; color: #fff">No</button>
					</center>
				</div>
</form>
			</div>
			<!-- /.modal-content -->
		</div>
		<!-- /.modal-dialog -->
	</div>
	<!-- /.modal -->
	


<!-- *************************ticket view modal with comments********************* -->



<!-- modal -->
<div id="fsModal"
     class="modal animated bounceIn mdl"
     tabindex="-1"
     role="dialog"
     aria-labelledby="myModalLabel"
     aria-hidden="true">

  <!-- dialog -->
  <div class="modal-dialog mdl-dialog">

    <!-- content -->
    <div class="modal-content mdl-content">

      <!-- header -->
      <div class="modal-header mdl-header">
        <h1 id="myModalLabel"
            class="modal-title mdl-title">
          View Details
        </h1>
      </div>
      <!-- header -->
      
      <!-- body -->
      <div class="modal-body mdl-body">


        <div class="agil-info-calendar">
		
		<div class="col-md-7 w3agile-notifications">
<!-- 			<div class="notifications"> -->
				<!--notification start-->
				
					<header class="panel-heading">
						Details 
					</header>
					<div class="notify-w3ls col-md-12 detail-div">
<!-- Details from ajax -->
						
					</div>
				
				<!--notification end-->
<!-- 				</div> -->
			</div>
			
			<div class="col-md-5 w3agile-notifications">
<!-- 			<div class="notifications chatBox"> -->
				<!--notification start-->
				
					<header class="panel-heading">
						Comments 
					</header>
					<div class="notify-w3ls col-md-12 chatBox">
						
						


<div class="detailBox">
    
   
    <div class="actionBox">
        <ul class="commentList">
      
        </ul>
            <div class="form-group col-md-12">
            <div class="col-md-12 outDiv" ><textarea class="form-control commentBox" type="text" placeholder="Your comments" name="comment"  id="comment"></textarea></div><div class="col-md-12"><input type="file" name="commentFile" id="commentFile" class="fileclass btn btn-success"/><button id="addCmtBtn" type="button" class="btn btn-success">send</button></div>
            
            </div>
<!--             <i class="fa fa-paper-plane" id="addCmtBtn"></i> -->
    </div>
</div>

						
					</div>
				
				<!--notification end-->
<!-- 				</div> -->
			</div>
			<div class="clearfix"> </div>
		</div>

      </div>
      <!-- body -->

      <!-- footer -->
      <div class="modal-footer mdl-footer">
      <div class="form-group col-md-12">
      <div class="form-group col-md-10" >
      <div id="updateDiv">
      <div class="col-md-1"><label>Status: </label></div>
      <div class="col-md-3">
      <select class=" form-control" name="tktTypeId" id="tkt-type-action"></select></div>
    
        <div id="tkt-issue-type"></div>
         <button class="btn btn-success col-md-2" onclick="updateTicketType()">Update Status</button>
        </div>
        <div class="col-md-1" id="pushpop">
         
        </div>
       
        </div>
          <div class="col-md-2">
          <button class="btn btn-danger"  data-dismiss="modal">close</button>
          </div>
        </div>
        <!-- <button class="btn btn-default">
          Default
        </button>
        <button class="btn btn-primary" data-dismiss="modal">
          Close
        </button> -->
      </div>
      <!-- footer -->

    </div>
    <!-- content -->

  </div>
  <!-- dialog -->

</div>
<!-- modal --> 

<!-- *************************ticket view modal after search ********************* -->



<!-- modal -->
<div id="searchModal"
     class="modal animated bounceIn mdl"
     tabindex="-1"
     role="dialog"
     aria-labelledby="myModalLabel"
     aria-hidden="true">

  <!-- dialog -->
  <div class="modal-dialog mdl-dialog">

    <!-- content -->
    <div class="modal-content mdl-content">

      <!-- header -->
      <div class="modal-header mdl-header">
        <h1 id="myModalLabel"
            class="modal-title mdl-title">
          View Details
        </h1>
       
      </div>
      <!-- header -->
      
      <!-- body -->
      <div class="modal-body mdl-body">


        <div class="agil-info-calendar">
		
		<div class="col-md-12 w3agile-notifications">
<!-- 			<div class="notifications"> -->
				<!--notification start-->
				
					<header class="panel-heading">
						Detail 
					</header>
					<div class="notify-w3ls col-md-12 alldetail-div">
<!-- Details from ajax -->
						
					</div>
				
				<!--notification end-->
<!-- 				</div> -->
			</div>
			
			
			<div class="clearfix"> </div>
		</div>
 
      </div>
      

    </div>
    <!-- content -->
<div class="col-md-12">
          <button class="btn btn-danger bb"  data-dismiss="modal">close</button>
          </div>
  </div>
  <!-- dialog -->

</div>
<!-- modal --> 
	



<!-- Ticket Genrate model -->
<%-- 	<div class="modal animated bounceIn mdl"
     tabindex="-1"
     role="dialog"
     aria-labelledby="myModalLabel"
     aria-hidden="true" id="modal-tkt-create">
<!-- 	<div class="modal modal-success fade" id="modal-tkt-create"> -->
		<div class="modal-dialog mdl-dialog">
			<div class="modal-content mdl-content">
			
<form method="POST" action="raise-ticket" enctype="multipart/form-data"  class="cmxform form-horizontal" onsubmit="return validateTicketForm()" name="ticketForm">
	
				<div class="modal-body mdl-body">
					
					










<div class="col-lg-12">
                    <section class="panel">
                        <header class="panel-heading">
                            Ticket-Genrate
                         
                        </header>
                        <div class="panel-body">
                            <div class=" form">
                                   
                                    <div class="form-group required">
                                        <label for="cname" class="control-label col-lg-3">Project</label>
                                         <div class="col-lg-9">
                                         	<select class=" form-control" name="projectId">
											    
											     <option value="0">Select Project</option>
											      <c:forEach items="${projectList}"  var="project">
											         <option value="${project.project_id}">${project.project_name}</option>
											     </c:forEach>
										 	</select>
									    </div>
                                    </div>
                                    <div class="form-group required">
                                        <label for="cemail" class="control-label col-lg-3">Issue Type</label>
                                        <div class="col-lg-9">
                                         	<select class=" form-control" name="tktTypeId">
											     <c:forEach items="${issueType}"  var="issue">
											         <option value="${issue.type_id}">${issue.type}</option>
											     </c:forEach>
											     <option value="1">NEW</option>
										 	</select>
									    </div>
                                    </div>
                                    <div class="form-group required">
                                        <label for="curl" class="control-label col-lg-3">Summary</label>
                                        <div class="col-lg-9">
                                            <input class="form-control " type="text" name="tktSummary">
                                        </div>
                                    </div>
                                    <div class="form-group required">
                                        <label for="curl" class="control-label col-lg-3">Assignee</label>
                                         <div class="col-lg-9">
                                         	<select class=" form-control" name="assignedToId">
                                         	 <option value="0">Select Assignee</option>
											     <c:forEach items="${userList}"  var="person">
											         <option value="${person.user_id}">${person.user_name}</option>
											     </c:forEach>
										 	</select>
									    </div>
                                    </div>
                                     <div class="form-group required">
                                        <label for="curl" class="control-label col-lg-3">Environment</label>
                                        <div class="col-lg-9">
                                           <select class=" form-control" name="environmentType">
											    <option value="0">Production</option>
											    <option value="1">UAT</option>
										 	</select>
                                        </div>
                                    </div>
                                    <div class="form-group required">
                                        <label for="curl" class="control-label col-lg-3">Municipality Name</label>
                                        <div class="col-lg-9">
                                         	<select class=" form-control" name="ulbId">
                                         	 <option value="0">Select Municipality Name</option>
											     <c:forEach items="${cityList}"  var="city">
											         <option value="${city.town_id}">${city.town_name}</option>
											     </c:forEach>
										 	</select>
									    </div>
                                    </div>
                                     <div class="form-group required">
                                        <label for="curl" class="control-label col-lg-3">Create Date</label>
                                      
        			<div class='col-lg-9'>
                            <div class='input-group date'>
                            <%java.text.DateFormat df = new java.text.SimpleDateFormat("dd/MM/yyyy"); %>
                    <input type='text' class="form-control" id='datepicker' name="raisedDate" value="<%= df.format(new java.util.Date()) %>" readonly/>
                    <span class="input-group-addon">
                        <span class="glyphicon glyphicon-calendar"></span>
                    </span>
                </div>
           </div>
            </div>
                                    <div class="form-group required">
                                        <label for="curl" class="control-label col-lg-3">Priority</label>
                                        <div class="col-lg-9">
                                         	<select class=" form-control" name="tktPriority">
											     <c:forEach items="${priority}"  var="priority">
											         <option value="${priority.priority_id}">${priority.priority}</option>
											     </c:forEach>
										 	</select>
									    </div>
                                    </div>
                                    
                                         <div class="form-group ">
                                        <label for="ccomment" class="control-label col-lg-3">Description</label>
                                        <div class="col-lg-9">
                                            <textarea class="form-control " name="tktDescription"></textarea>
                                        </div>
                                    </div>
                                    
                                       <div class="form-group ">
                                        <label for="curl" class="control-label col-lg-3">Attachment</label>
                                        <div class="col-lg-9">
                                           <input type="file" id="files" name="files[]" multiple="multiple"/>
                                        </div>


                                    </div>
                               
                                   <!--  <div class="form-group">
                                        <div class="col-lg-offset-3 col-lg-6">
                                            <button class="btn btn-primary" type="submit">Save</button>
                                            <button class="btn btn-default" type="button">Cancel</button>
                                        </div>
                                    </div> -->
                               
                            </div>

                        </div>
                    </section>
                </div>



					
				</div>

				<div class="modal-footer mdl-footer">
					
						<button type="submit" class="btn btn-outline" style="background: #53d769; color:#fff">
							Create
						</button>
						<button type="button" class="btn btn-outline" data-dismiss="modal" style="background: #fc3158; color: #fff">Cancel</button>
					
				</div>
				</form>

			</div>
			<!-- /.modal-content -->
		</div>
		<!-- /.modal-dialog -->
	</div>
	<!-- /.modal -->
	 --%>

</body>
</html>