<%@ taglib prefix="l" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<section id="main-content">
	<section class="wrapper">
		<div id="loading" style="display: none;">
			<img id="loading-image" src="/ticket/static/images/loader.gif"
				alt="Loading..." />
		</div>
		<div id="dsboard">
			<!-- //market-->

			<div class="market-updates">

				<l:choose>
					<l:when test="${userType == '0'}">
						<div class="col-md-4 market-update-gd">
							<div class="market-update-block clr-block-2">
								<div class="col-md-4 market-update-right">
									<i class="fa fa-clipboard" aria-hidden="true"></i>
								</div>
								<div class="col-md-8 market-update-left">
									<h4>
										Raised <br> By Me
									</h4>
									<h3>${ticketRaisedByMe}</h3>

								</div>
								<div class="clearfix"></div>
							</div>
						</div>
					</l:when>

					<l:when test="${userType == '2'}">
						<c:forEach items="${assignCountList}" var="asnList">
							<div class="col-md-4 market-update-gd">
								<div class="market-update-block clr-block-4">
									<div class="col-md-4 market-update-right">
										<i class="fa fa-clipboard" aria-hidden="true"></i>
									</div>
									<div class="col-md-8 market-update-left">
										<a href="common-ticket"><h4>
												Common <br> Ticket
											</h4>
											<h3>${asnList.common}</h3> </a>
									</div>
									<div class="clearfix"></div>
								</div>
							</div>
						</c:forEach>
					</l:when>
					<l:otherwise>
						<c:forEach items="${assignCountList}" var="asnList">
							<div class="col-md-4 market-update-gd">
								<div class="market-update-block clr-block-4">
									<div class="col-md-4 market-update-right">
										<i class="fa fa-clipboard" aria-hidden="true"></i>
									</div>
									<div class="col-md-8 market-update-left">
										<a href="common-ticket"><h4>
												Common <br> Ticket
											</h4>
											<h3>${asnList.common}</h3> </a>
									</div>
									<div class="clearfix"></div>
								</div>
							</div>
						</c:forEach>

						<%-- <div class="col-md-3 market-update-gd">
					<div class="market-update-block clr-block-2">
						<div class="col-md-4 market-update-right">
							<i class="fa fa-clipboard" aria-hidden="true"></i>
						</div>
						<div class="col-md-8 market-update-left">
							<h4>
								Assigned <br> to Me
							</h4>
							<h3>${ticketReportedByMe}</h3>

						</div>
						<div class="clearfix"></div>
					</div>
				</div> --%>

					</l:otherwise>
				</l:choose>
				<div class="col-md-4 market-update-gd">
					<div class="market-update-block clr-block-3">
						<div class="col-md-4 market-update-right">
							<i class="fa fa-list-alt" aria-hidden="true"></i>
						</div>
						<div class="col-md-8 market-update-left">
							<h4>
								Pending <br> Ticket
							</h4>
							<h3>${pendingTicket}</h3>

						</div>
						<div class="clearfix"></div>
					</div>
				</div>

				<div class="col-md-4 market-update-gd">
					<div class="market-update-block clr-block-1">
						<div class="col-md-4 market-update-right">
							<i class="fa fa-clipboard" aria-hidden="true"></i>
						</div>
						<div class="col-md-8 market-update-left">
							<h4>
								Resolved<br> Ticket
							</h4>
							<h3>${resolvedTicket}</h3>

						</div>
						<div class="clearfix"></div>
					</div>
				</div>
				<div class="clearfix"></div>
			</div>



			<!-- tasks -->
			<l:set var="val" value="${userType}" />
			<l:choose>
				<l:when test="${val == 2}">
					<div class="col-md-12 stats-info stats-last widget-shadow">
						<section class="panel">
							<header class="panel-heading wht-bg">
								<a class="btn btn-head"> STAFF LIST </a>
							</header>
							<div class="stats-last-agile">
								<table class="table stats-table example" id="example">
									<thead>
										<tr>
											<th>S.NO</th>
											<th>NAME</th>
											<th>EMAIL</th>
											<th>MOBILE NO</th>
											<th>PENDING TICKET</th>
											<th>RESOLVED TICKET</th>
											<th>DETAIL</th>
										</tr>
									</thead>
									<tbody>

										<%
											int i = 0;
										%>
										<l:forEach items="${staffList}" var="list">
											<tr>
												<th scope="row"><%=++i%></th>
												<td>${list.userName}</td>
												<td>${list.userEmail}</td>
												<td>${list.userMobileNo}</td>
												<td>${list.pendingTKT}</td>
												<td>${list.resolvedTKT}</td>
												<td>
													<form action="dashboard" method="Post" name="LoginForm">
														<input type="hidden" name="userEmail"
															value="${list.userEmail}"> <input type="hidden"
															name="userPassword" value="${list.userPassword}">
														<button>
															<i class='fa fa-clipboard' aria-hidden='true'></i>
														</button>
													</form>
												</td>
											</tr>

										</l:forEach>


									</tbody>
								</table>
							</div>
						</section>
					</div>






					<div class="col-md-12 stats-info stats-last widget-shadow">
						<section class="panel">
							<header class="panel-heading wht-bg">
								<a class="btn btn-head"> PROJECT LIST </a>
							</header>
							<div class="stats-last-agile">
								<table class="table stats-table example" id="example">
									<thead>
										<tr>
											<th>S.NO</th>
											<th>PROJECT NAME</th>
											<th>PENDING TICKET</th>
											<th>RESOLVED TICKET</th>
											<th>STATUS</th>
										</tr>
									</thead>
									<tbody>

										<%
											int j = 0;
										%>
										<l:forEach items="${proList}" var="lists">
											<tr>
												<th scope="row"><%=++j%></th>
												<td>${lists.projectName}</td>
												<td>${lists.pendingTKT}</td>
												<td>${lists.resolvedTKT}</td>
												<td><l:choose>
														<l:when test="${lists.projectStatus==0}">

															<i style="color: green; font-size: xx-large;"
																class="fa fa-dot-circle-o" aria-hidden="true"></i>

														</l:when>
														<l:otherwise>
															<i style="color: red; font-size: xx-large;"
																class="fa fa-dot-circle-o" aria-hidden="true"></i>

														</l:otherwise>
													</l:choose></td>
											</tr>

										</l:forEach>


									</tbody>
								</table>
							</div>
						</section>
					</div>

				</l:when>
			</l:choose>
		</div>
		<div class="col-sm-12 mail-w3agile" id="table-div"
			style="display: none;"></div>

		<div id="settingForm" style="display: none;">
			<%@ include file="/WEB-INF/views/pages/setting.jsp"%>
		</div>
		<div id="genrateTicketForm" style="display: none;">

			<section class="panel">
				<header class="panel-heading"> Generate Ticket </header>
				<div class="panel-body">
					<div class="position-center">
						<form method="POST" action="raise-ticket-form"
							enctype="multipart/form-data" class="cmxform form-horizontal"
							onsubmit="return validateTicketForm()" name="ticketForm"
							id="createTicketForm">

							<div class="panel-body">
								<div class=" form">

									<div class="form-group required">
										<label for="cname" class="control-label col-lg-3">Project</label>
										<div class="col-lg-9">
											<select class=" form-control" name="projectId" id="projectId">

												<option value="0">Select Project</option>
												<c:forEach items="${projectList}" var="project">
													<option value="${project.project_id}">${project.project_name}</option>
												</c:forEach>
											</select>
										</div>
									</div>

									<div class="form-group required">
										<label for="cemail" class="control-label col-lg-3">Issue
											Category</label>
										<div class="col-lg-9">
											<select class=" form-control" name="issueCategoryId"
												id="issueCategoryId">
												<%-- 											     <c:forEach items="${issueType}"  var="issue"> --%>
												<%-- 											         <option value="${issue.type_id}">${issue.type}</option> --%>
												<%-- 											     </c:forEach> --%>
											</select>
										</div>
									</div>

									<div class="form-group required">
										<label for="curl" class="control-label col-lg-3">Summary</label>
										<div class="col-lg-9">
											<input class="form-control " type="text" name="tktSummary">
										</div>
									</div>
									<input type="hidden" value="${userType}" id="usertypeid" name="usertypeid"/>
							
					<l:choose>
									<l:when test="${userType == '3'}">
						
												<div class="form-group required"> 
									 										<label for="curl" class="control-label col-lg-3">ULB</label> 
									 										<div class="col-lg-9"> 
									 											<select class=" form-control" name="ulbId" id="ulbId"> 
									 												<option value="0">Select ULB</option> 
									 												<c:forEach items="${cityList}" var="ulb"> 
									 													<option value="${ulb.town_id}">${ulb.town_name}</option> 
									 												</c:forEach> 
									 											</select> 
									 										</div> 
									 									</div> 
									 									</l:when>
									 									</l:choose>
						
									
									<!-- 									<div class="form-group required"> -->
									<%-- 										<label for="curl" class="control-label col-lg-3">Assignee</label> --%>
									<!-- 										<div class="col-lg-9"> -->
									<!-- 											<select class=" form-control" name="assignedToId"> -->
									<!-- 												<option value="0">Select Assignee</option> -->
									<%-- 												<c:forEach items="${userList}" var="person"> --%>
									<%-- 													<option value="${person.user_id}">${person.user_name}</option> --%>
									<%-- 												</c:forEach> --%>
									<!-- 											</select> -->
									<!-- 										</div> -->
									<!-- 									</div> -->
									<%-- 		<div class="form-group required">
										<label for="curl" class="control-label col-lg-3">Environment</label>
										<div class="col-lg-9">
											<select class=" form-control" name="environmentType">
												<option value="0">Production</option>
												<option value="1">UAT</option>
											</select>
										</div>
									</div> --%>

									<div class="form-group required">
										<label for="curl" class="control-label col-lg-3">Create
											Date</label>

										<div class='col-lg-9'>
											<div class='input-group date'>
												<%
													java.text.DateFormat df = new java.text.SimpleDateFormat("dd/MM/yyyy");
												%>
												<input type='text' class="form-control" id='datepicker'
													name="raisedDate"
													value="<%=df.format(new java.util.Date())%>" readonly /> <span
													class="input-group-addon"> <span
													class="glyphicon glyphicon-calendar"></span>
												</span>
											</div>
										</div>
									</div>
									<%-- <div class="form-group required">
										<label for="curl" class="control-label col-lg-3">Priority</label>
										<div class="col-lg-9">
											<select class=" form-control" name="tktPriority">
												<c:forEach items="${priority}" var="priority">
													<option value="${priority.priority_id}">${priority.priority}</option>
												</c:forEach>
											</select>
										</div>
									</div> --%>

									<div class="form-group ">
										<label for="ccomment" class="control-label col-lg-3">Description</label>
										<div class="col-lg-9">
											<textarea class="form-control " name="tktDescription"></textarea>
										</div>
									</div>

									<div class="form-group ">
										<label for="curl" class="control-label col-lg-3">Attachment</label>
										<div class="col-lg-9 fileplace">
<!-- 										  <input type="file" id="files0" name="files" multiple onchange="getFile()"/> -->
<!--                                             <input type="file" id="files1" name="files" multiple/> -->
<!--                                              <input type="file" id="files2" name="files" multiple/> -->
											<input type="file" id="files" name="dd" accept="image/jpg,image/png,image/jpeg,.csv, .pdf, .xlsx, .docx" />
									<input type="hidden" id="attach" name="attachment" value="0" />
										</div>

									</div>
									<span style="color: red; font-size: 25px; font-weight: 786;"
										id="errorMsg"></span>
									<button class="btn btn-primary" type="submit"
										style="float: right">UPLOAD</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</section>
		</div>
	</section>
</section>


<script type="text/javascript">
	$(document).ready(function() {
// 		$('.example').DataTable();
		  $('.example').DataTable( {
        "order": [[ 0, "desc" ]]
    });
	});
	
</script>