<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<script>

window.onload = function(e) {
	assignedTicketList(1,'ASSIGNED-TICKET');
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
                        <a class="btn btn-head">
                            Assigned Tickets
                        </a>
                        <ul class="nav nav-pills nav-stacked mail-nav">
                        <c:forEach items="${countList}"  var="count">
											       
											   
                            <li onclick="assignedTicketList(1,'ASSIGNED-TICKET')"><a href="#"> <i class="fa fa-clipboard"></i> Assigned  <span class="label label-default pull-right inbox-notification">${count.assigned}</span></a></li>
                            <li onclick="assignedTicketList(3,'IN-PROGRESS-TICKET')"><a href="#"> <i class="fa fa-spinner"></i> IN-Progress<span class="label label-primary pull-right inbox-notification">${count.progress}</span></a></li>
                            <li onclick="assignedTicketList(4,'ON-HOLD-TICKET')"><a href="#"> <i class="fa fa-certificate"></i> ON-Hold<span class="label label-info pull-right inbox-notification">${count.hold}</span></a></li>
                            <li onclick="assignedTicketList(5,'RESOLVED-TICKET')"><a href="#"> <i class="fa fa-check-square-o"></i> Resolved <span class="label label-warning pull-right inbox-notification">${count.resolved}</span></a></li>
                            <li onclick="assignedTicketList(6,'CLOSED-TICKET')"><a href="#"> <i class="fa fa-trash-o"></i> Closed<span class="label label-success pull-right inbox-notification">${count.closed}</span></a></li>
                            <li onclick="assignedTicketList(7,'RE-ASSIGNED-TICKET')"><a href="#"> <i class="fa fa-pencil-square-o"></i> Re-Assigned<span class="label label-danger pull-right inbox-notification">${count.reassigned}</span></a></li>
                         </c:forEach>
                        </ul>
                    </div>
                </section>
                </div>
            <div class="col-sm-9 mail-w3agile" id="table-div">
            </div>
        </div>

        <!-- page end-->
		 </div>
</section>
</section>

<!--main content end-->
</section>



	