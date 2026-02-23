<div class="log-w3" style="${logStyle}">
<div class="w3layouts-main">

	<h2>Sign In Now</h2>
		<form action="dashboard" method="Post" onsubmit="return validateLoginForm()" name="LoginForm">
			<input type="text" class="ggg" name="userEmail" placeholder="EMAIL" id="email">
			<input type="password" class="ggg" name="userPassword" placeholder="PASSWORD" id="password">
<!-- 			<input type="hidden" name="userType" value="1"> -->
			<!-- <span><input type="checkbox" />Remember Me</span>
			<h6><a href="#">Forgot Password?</a></h6> -->
			<div><p style="color:red">${message}</p></div>
				<div class="clearfix"></div>
				<input type="submit" value="Sign In" name="login">
		</form>
<!-- 		<p>Don't Have an Account ?<a href="#">Create an account</a></p> -->
</div>
</div>





<div class="log-w3" style="${regStyle}">

<div class="w3layouts-main">

	<h2>Register Now</h2>
		<form action="register" method="Post" onsubmit="return validateRegForm()"  name="registerForm">
			<input type="text" class="ggg" name="userName" placeholder="ENTER USER NAME" id="regName">
			<input type="text" class="ggg" name="userEmail" placeholder="ENTER USER EMAIL" id="regEmail">
			<input type="text" class="ggg" name="userMobileNo" placeholder="ENTER USER PHONE NO" id="regPhone">
            <select class="myselect ggg" id='select_twn' name="ulbId"></select>
			<input type="password" class="ggg" name="userPassword" placeholder="ENTER USER PASSWORD" id="regPassword">
			<input type="password" class="ggg" name="userCPassword" placeholder="ENTER CONFIRM PASSWORD" id="regCPassword">
				<div><p style="color:red">${errorMessage}</p></div>
				<div class="clearfix"></div>
				<input type="submit" value="Sign UP" name="signup">
		</form>
</div>
</div>
 <script type="text/javascript">
            $(".myselect").select2();
            $(document).ready(function () {
 getAllTowns();
});
        </script>