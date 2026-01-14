<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<script>

window.onload = function(e) {
	raisedTicketList(1,'NEW-TICKET');
};

</script>
<section id="container">
<section id="main-content">
	<section class="wrapper">
		<!-- page start-->
		<div class="mail-w3agile">
        <div class="row">
            <div class="col-sm-3 com-w3ls">
                <section class="panel">
                    <div class="panel-body">
                        <a href="#"  class="btn btn-compose" data-toggle="modal" data-target="#modal-tkt-create">
                            Compose Ticket
                        </a>
                        <ul class="nav nav-pills nav-stacked mail-nav">
                        <c:forEach items="${countList}"  var="count">
											       
											   
                            <li onclick="raisedTicketList(1,'NEW-TICKET')"><a href="#"> <i class="fa fa-clipboard"></i> Latest  <span class="label label-default pull-right inbox-notification">${count.latest}</span></a></li>
                            <li onclick="raisedTicketList(3,'IN-PROGRESS-TICKET')"><a href="#"> <i class="fa fa-spinner"></i> IN-Progress<span class="label label-primary pull-right inbox-notification">${count.progress}</span></a></li>
                            <li onclick="raisedTicketList(4,'ON-HOLD-TICKET')"><a href="#"> <i class="fa fa-certificate"></i> ON-Hold<span class="label label-info pull-right inbox-notification">${count.hold}</span></a></li>
                            <li onclick="raisedTicketList(5,'RESOLVED-TICKET')"><a href="#"> <i class="fa fa-check-square-o"></i> Resolved <span class="label label-warning pull-right inbox-notification">${count.resolved}</span></a></li>
                            <li onclick="raisedTicketList(6,'CLOSED-TICKET')"><a href="#"> <i class="fa fa-trash-o"></i> Closed<span class="label label-success pull-right inbox-notification">${count.closed}</span></a></li>
                            <li onclick="raisedTicketList(8,'RE-OPENED-TICKET')"><a href="#"> <i class="fa fa-pencil-square-o"></i> Re-Opened<span class="label label-danger pull-right inbox-notification">${count.reopen}</span></a></li>
                         </c:forEach>
                        </ul>
                    </div>
                </section>

                
            </div>
            
            <div class="col-sm-9 mail-w3agile" id="table-div"></div>
        </div>

        <!-- page end-->
		 </div>
</section>
</section>

<!--main content end-->
</section>


	<!-- Ticket Genrate model -->
	<div class="modal animated bounceIn mdl"
     tabindex="-1"
     role="dialog"
     aria-labelledby="myModalLabel"
     aria-hidden="true" id="modal-tkt-create">
		<div class="modal-dialog mdl-dialog">
			<div class="modal-content mdl-content">
			
<%-- <form method="POST" action="raise-ticket1" enctype="multipart/form-data"  class="cmxform form-horizontal" onsubmit="return validateTicketForm()" name="ticketForm">
	
				<div class="modal-body mdl-body">
					

<div class="col-lg-12">
                    <section class="panel">
                        <header class="panel-heading">
                            Ticket-Generate
                         
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
                                           <input type="file" id="files" name="files[]" multiple/>
                                            <input type="file" id="files" name="files[]" multiple/>
                                             <input type="file" id="files" name="files[]" multiple/>
                                        </div>

<div id="selectedFiles"></div>
                                    </div> </div>

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
				</form> --%>

			</div>
			<!-- /.modal-content -->
		</div>
		<!-- /.modal-dialog -->
	</div>
	<!-- /.modal -->
	

	
	