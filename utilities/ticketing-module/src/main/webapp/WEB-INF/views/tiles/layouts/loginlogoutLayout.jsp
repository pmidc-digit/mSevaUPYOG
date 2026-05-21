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
<link href="<c:url value='/static/css/bootstrap.min.css' />" rel="stylesheet"></link>
<link href="<c:url value='/static/css/font-awesome.css' />"	rel="stylesheet"></link>
<link href="<c:url value='/static/css/font.css' />" rel="stylesheet"></link>
<link href="<c:url value='/static/css/style.css' />" rel="stylesheet"></link>
<link href="<c:url value='/static/css/select2.min.css' />" rel="stylesheet"></link>
<link href="<c:url value='/static/css/style-responsive.css' />" rel="stylesheet"></link>

<link href="<c:url value='/static/css/modal-style.css' />" rel="stylesheet"></link>
<script src="<c:url value="/static/js/jquery2.0.3.min.js"/>"></script>
<script src="<c:url value="/static/js/bootstrap.js"/>"></script>
<%-- <link href="<c:url value='https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css' />" rel="stylesheet"></link> --%>
<link href="<c:url value='/static/css/animate.min.css' />" rel="stylesheet"></link>
<script src="<c:url value="/static/js/developer.js"/>"></script>
<script src="<c:url value="/static/js/select2.min.js"/>"></script>


<%-- <script src="<c:url value="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"/>"></script> --%>
<%-- <script src="<c:url value="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.2.0/js/bootstrap.min.js"/>"></script> --%>
</head>
<body>
<section id="site-content">
		<tiles:insertAttribute name="body" />
	</section>
</body>
</html>