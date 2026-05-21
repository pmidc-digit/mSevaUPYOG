
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<link rel="shortcut icon" media="all" href="./img/browser-icon.png">
<title>Search Property</title>
<link rel="stylesheet" type="text/css" media="all" href="./css/style.css">
<link rel="stylesheet" type="text/css" media="all" href="./css/bootstrap.min.css">
<link rel="stylesheet" type="text/css" media="all" href="./css/font-awesome.min.css">
<script src="./js/jquery.min.js"></script>
<script src="./js/developer.js"></script>
<link rel="stylesheet" type="text/css" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css" />

	<script type="text/javascript" 
		src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
	<script type="text/javascript" 
		src="httpss://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js"></script>


</head>

<body>
<input type="hidden" value="${ulb}" id="ulb">
	<p class="hadder-message">${page}<a class="coll-info" onclick="onclickHeader('${ulb}')" >Check FY Summary &nbsp;<i class="fa fa-sign-in" aria-hidden="true"></i></a></p>
	<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 well no-padding">
		<section>
		<div class="sec-1">
      <div class="col-sm-12 col-md-12 txt">
			
			<div class="col-sm-12 col-md-4 txt">
			<input type="text" placeholder="SEARCH BY RETURN-ID"
			class="textbox form-control input-lg" id="retid">
			</div>
			
			     <div class="col-sm-12 col-md-4 txt">
				<input type="text" placeholder="SEARCH BY MOBILE-NO"
					class="form-control input-lg textbox" id="phone">
			</div>
			
			 <div class="col-sm-12 col-md-4 txt">
                        <select class="form-control input-lg" id="year" name="year">
                            <option value="">Search By Ass/Year</option>
                            <option value="2013-2014">2013-2014</option>
                            <option value="2014-2015">2014-2015</option>
                            <option value="2015-2016">2015-2016</option>
                            <option value="2016-2017">2016-2017</option>
                            <option value="2017-2018">2017-2018</option>
                            <option value="2018-2019">2018-2019</option>
                            <option value="2019-2020">2019-2020</option>
                            <option value="2020-2021">2020-2021</option>
                            <option value="2021-2022">2021-2022</option>
                            <option value="2022-2023">2022-2023</option>
                        </select>
                    </div>
               
                    </div>
                    
                    
                    <div class="col-sm-12 col-md-12 txt">
			
			<div class="col-sm-12 col-md-6 txt">
				<input type="text" placeholder="SEARCH BY OWNER-NAME/FATHER-NAME"
					class="form-control input-lg textbox" id="owner">
			</div>
			
			<div class="col-sm-12 col-md-3 txt">
				<input type="text" placeholder="SEARCH BY LOCALITY"
					class="form-control input-lg textbox" id="locality" value="">
			</div>


			<div class="col-sm-12 col-md-3">
				<div style="display: block;">
					<button type="button" class="btn btn-primary search" id="subBtn"
						onclick="hitButton('${ulb}')">
						<i class="fa fa-search" aria-hidden="true"></i>
					</button>
				</div>
				<div style="display: none;" id="refBtn">
					<i class="fa fa-cog fa-spin fa-3x fa-fw"></i>
				</div>
			</div>
			</div>
			</div>
<!-- 			for collect info... -->
			
			
			<div class="col-sm-12 col-md-12 txt sec-2" style="display: none;">
			
			 <div class="col-sm-12 col-md-8 txt">
                        <select class="form-control input-lg" id="years" name="year">
                            <option value="">Search By Ass/Year</option>
                            <option value="2013-2014">2013-2014</option>
                            <option value="2014-2015">2014-2015</option>
                            <option value="2015-2016">2015-2016</option>
                            <option value="2016-2017">2016-2017</option>
                            <option value="2017-2018">2017-2018</option>
                            <option value="2018-2019">2018-2019</option>
                            <option value="2019-2020">2019-2020</option>
                            <option value="2020-2021">2020-2021</option>
                            <option value="2021-2022">2021-2022</option>
                            <option value="2022-2023">2022-2023</option>
                        </select>
                    </div>
               
               <div class="col-sm-12 col-md-1">
				<div style="display: block;">
					<button type="button" class="btn btn-primary search" id="subBtn1"
						onclick="onclickSubBtn('${ulb}')">
						<i class="fa fa-search" aria-hidden="true"></i>
					</button>
				</div>
				
				<div style="display: none;" id="refBtn1">
					<i class="fa fa-cog fa-spin fa-3x fa-fw"></i>
				</div>
				</div>
				
			<div class="col-sm-12 col-md-1">
			<div class="btn btn-primary" onclick="backBtn()">
					Back
				</div>
                    </div>
                    </div>
                    
		</section>

	<!--table div start-->
	<div id="tbl-tr"></div>
	<!--table div end-->


	<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 well no-padding"
		style="display: none;" id="error-msg">
		<section>
			<p class="error-message-pera">No Record Found.Please Enter
				Correct Information!</p>
		</section>
	</div>

</body>

</html>

<script type="text/javascript">
var ulb = $('#ulb').val();
if(ulb==='asr')
	{
	$('.coll-info').show();
	
	}
else
	{
	$('.coll-info').hide();
	}

</script>

