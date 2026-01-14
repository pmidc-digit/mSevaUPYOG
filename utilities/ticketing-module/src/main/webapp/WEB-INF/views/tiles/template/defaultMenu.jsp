<%-- <nav>
	<a href="${pageContext.request.contextPath}/"><img class="logo" src="${pageContext.request.contextPath}/static/img/Linux-icon.png"></a>
	<ul id="menu">
		<li><a href="${pageContext.request.contextPath}/">Home</a></li>
       <li><a href="${pageContext.request.contextPath}/products">Products</a></li>
       <li><a href="${pageContext.request.contextPath}/contactus">Contact Us</a></li>
	</ul>
</nav> --%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<aside>
	<div id="sidebar" class="nav-collapse">
		<!-- sidebar menu start-->
		<div class="leftside-navigation">
			<ul class="sidebar-menu" id="nav-accordion">
				<li><a class="active" href="dashboard"> <i
						class="fa fa-dashboard"></i> <span>Dashboard</span>
				</a></li>
				
				<c:set var="val" value="${userType}" />
				<c:choose>
					<c:when test="${val == 0 || val== 3}">
						<li><a onclick="genrateTicketForm()" style="cursor: pointer;"> <i
								class="fa fa-pencil-square-o"></i> <span>Generate Ticket</span>
						</a></li>

						<c:forEach items="${raiseCountList}" var="risList">
							<li onclick="raisedTicketList(1,'NEW-TICKET')"><a href="#">
									<i class="fa fa-clipboard"></i> Latest <span
									class="label label-default pull-right inbox-notification">${risList.latest}</span>
							</a></li>
							<li onclick="raisedTicketList(3,'IN-PROGRESS-TICKET')"><a
								href="#"> <i class="fa fa-spinner"></i> IN-Progress<span
									class="label label-primary pull-right inbox-notification">${risList.progress}</span></a></li>
							<li onclick="raisedTicketList(4,'ON-HOLD-TICKET')"><a
								href="#"> <i class="fa fa-certificate"></i> ON-Hold<span
									class="label label-info pull-right inbox-notification">${risList.hold}</span></a></li>
							<li onclick="raisedTicketList(5,'RESOLVED-TICKET')"><a
								href="#"> <i class="fa fa-check-square-o"></i> Resolved <span
									class="label label-warning pull-right inbox-notification">${risList.resolved}</span></a></li>
							<li onclick="raisedTicketList(6,'CLOSED-TICKET')"><a
								href="#"> <i class="fa fa-trash-o"></i> Closed<span
									class="label label-success pull-right inbox-notification">${risList.closed}</span></a></li>
							<li onclick="raisedTicketList(8,'RE-OPENED-TICKET')"><a
								href="#"> <i class="fa fa-pencil-square-o"></i> Re-Opened<span
									class="label label-danger pull-right inbox-notification">${risList.reopen}</span></a></li>
						</c:forEach>
					
						</c:when>
                                    <c:otherwise>

								<c:forEach items="${assignCountList}" var="asnList">

								<li><a href="common-ticket"> <i class="fa fa-list-alt"></i> Common-Ticket <span
											class="label label-default pull-right inbox-notification">${asnList.common}</span></a></li>
									<li onclick="assignedTicketList(1,'ASSIGNED-TICKET')"><a
										href="#"> <i class="fa fa-clipboard"></i> Assigned <span
											class="label label-default pull-right inbox-notification">${asnList.assigned}</span></a></li>
									<li onclick="assignedTicketList(3,'IN-PROGRESS-TICKET')"><a
										href="#"> <i class="fa fa-spinner"></i> IN-Progress<span
											class="label label-primary pull-right inbox-notification">${asnList.progress}</span></a></li>
									<li onclick="assignedTicketList(4,'ON-HOLD-TICKET')"><a
										href="#"> <i class="fa fa-certificate"></i> ON-Hold<span
											class="label label-info pull-right inbox-notification">${asnList.hold}</span></a></li>
									<li onclick="assignedTicketList(5,'RESOLVED-TICKET')"><a
										href="#"> <i class="fa fa-check-square-o"></i> Resolved <span
											class="label label-warning pull-right inbox-notification">${asnList.resolved}</span></a></li>
									<li onclick="assignedTicketList(6,'CLOSED-TICKET')"><a
										href="#"> <i class="fa fa-trash-o"></i> Closed<span
											class="label label-success pull-right inbox-notification">${asnList.closed}</span></a></li>
									<li onclick="assignedTicketList(8,'RE-ASSIGNED-TICKET')"><a
										href="#"> <i class="fa fa-pencil-square-o"></i>
											Re-Assigned<span
											class="label label-danger pull-right inbox-notification">${asnList.reassigned}</span></a></li>
								</c:forEach>
<!-- 							</ul></li> -->

					 </c:otherwise>
				</c:choose>

				<!--<li class="sub-menu">
                    <a href="javascript:;">
                        <i class="fa fa-envelope"></i>
                        <span>Raised Ticket </span>
                    </a>
                    <ul class="nav nav-pills nav-stacked mail-nav">
                       <!--  <li><a href="raised">Latest</a></li>
                        <li><a href="progress">IN-Progress</a></li>
                          <li><a href="hold">ON-Hold</a></li>
                            <li><a href="resolved">Resolved</a></li>
                              <li><a href="demo">Closed</a></li> 
                              
                               <c:forEach items="${countList}"  var="count">
											       
											   
                            <li onclick="raisedTicketList(1,'NEW-TICKET')"><a href="#"> <i class="fa fa-clipboard"></i> Latest  <span class="label label-default pull-right inbox-notification">${count.latest}</span></a></li>
                            <li onclick="raisedTicketList(3,'IN-PROGRESS-TICKET')"><a href="#"> <i class="fa fa-spinner"></i> IN-Progress<span class="label label-primary pull-right inbox-notification">${count.progress}</span></a></li>
                            <li onclick="raisedTicketList(4,'ON-HOLD-TICKET')"><a href="#"> <i class="fa fa-certificate"></i> ON-Hold<span class="label label-info pull-right inbox-notification">${count.hold}</span></a></li>
                            <li onclick="raisedTicketList(5,'RESOLVED-TICKET')"><a href="#"> <i class="fa fa-check-square-o"></i> Resolved <span class="label label-warning pull-right inbox-notification">${count.resolved}</span></a></li>
                            <li onclick="raisedTicketList(6,'CLOSED-TICKET')"><a href="#"> <i class="fa fa-trash-o"></i> Closed<span class="label label-success pull-right inbox-notification">${count.closed}</span></a></li>
                            <li onclick="raisedTicketList(8,'RE-OPENED-TICKET')"><a href="#"> <i class="fa fa-pencil-square-o"></i> Re-Opened<span class="label label-danger pull-right inbox-notification">${count.reopen}</span></a></li>
                         </c:forEach>
                    </ul>
                </li>
                
                <li class="sub-menu">
                    <a href="javascript:;">
                        <i class="fa fa-envelope"></i>
                        <span>Assigned Ticket </span>
                    </a>
                    <ul class="sub">
                        <li><a href="assigned">Latest</a></li>
                        <li><a href="in-progress">IN-Progress</a></li>
                          <li><a href="on-hold">ON-Hold</a></li>
                            <li><a href="reported">Resolved</a></li>
                              <li><a href="reassigned">Reassigned</a></li>
                    </ul>
                </li> -->

				<li data-toggle="modal" data-target="#modal-success"><a
					href="#"> <i class="fa fa-key"></i> <span>Logout</span>
				</a></li>
			</ul>
		</div>
		<!-- sidebar menu end-->
	</div>
</aside>
