/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function() {
		
	$("#locality").autocomplete({
		source : function(request, response) {
			$.getJSON("./jldlocality/", {
				keyword : request.term
			}, response);
		},
		search : function() {
			// custom minLength
			var term = this.value;
			if (term.length < 1) {
				return false;
			}
		},
		focus : function() {
			// prevent value inserted on focus
			return false;
		},
		select : function(event, ui) {
			var terms = split(this.value);
			// remove the current input
			terms.pop();
			// add the selected item
			terms.push(ui.item.value);
			// add placeholder to get the comma-and-space at the end
			terms.push("");
			this.value = terms.join(", ");
			return false;
		}
	});

});


function isValidate() {
	var returnid = document.getElementById("retid").value;
	var owner = document.getElementById("owner").value;
	var phone = document.getElementById("phone").value;
	if (returnid == "" && owner == "" && phone == "") {
		return false;
	} else {
		return true;
	}
}

// by header for collection info

function onclickHeader(val)
{
$(".sec-1").hide();
$(".sec-2").show();
$("#tbl-tr").hide();

}


function onclickSubBtn(val)
{
	
$(".sec-1").hide();
$(".sec-2").show();
$("#tbl-tr").hide();
$('#refBtn1').show();
$('#subBtn1').hide();
var assYear = $("#years :selected").val();
if (assYear != "") {
	$.ajax({
		url : "./collectSum-"+val+"byyear",
		data : {"assYear" : assYear},
		type : 'POST',
		success : function(result) {
			$("#tbl-tr").show();
			var content = "<div class='col-xs-12 col-sm-12 col-md-12 col-lg-12 well summary'>\
				<section><center>Check Financial Year Summary<table class='table table-bordered table-striped'><thead><tr><th>TOTAL-RECORDS</th><th>TOTAL-TAX-PAID</th></tr></thead><tbody>"
			+ "<tr><td>" + result.total
			+ "</td><td>" + result.sum + "</td></tr>"
			+ "</tbody></table></section></center></div>";
	$('#tbl-tr').html(content);
	$('#refBtn1').hide();
	$('#subBtn1').show();
	$('#error-msg1').hide();
		}
	
		});
	
}
else
	{
	alert("Please select assessment year first!");
	$('#years').focus();
	}
}


function backBtn() {
	$(".sec-2").hide();
	$(".sec-1").show();
	$("#tbl-tr").hide();
	};

// JLD
function hitButton(val) {
	if (isValidate()) {
		var returnid = "";
		var owner = "";
		var assYear = "";
		var phone = "";
		var DATA = "";
		var URL = "";
		$('#refBtn').show();
		$('#subBtn').hide();
		$('#error-msg').hide();
		$('#tbl-tr').hide();
		returnid = document.getElementById("retid").value;
		owner = document.getElementById("owner").value;
		phone = document.getElementById("phone").value;
		assYear = $("#year :selected").val();
		
	/*	if(returnid !="" && assYear == "") {
			alert("Please select assessment year also!")
				$('#refBtn').hide();
			$('#subBtn').show();
			return false;
		}
		else
		*/
		/*	{ */
		
		if (phone != "") {
			URL = "./search-"+val+"byphone", 
			DATA = {"phone" : phone}
//		} else if (returnid != "" && assYear != "") {
//
//			URL = "./search-"+val+"byrid", 
//			DATA = {"returnid" : returnid}
		}else if (assYear != "") {
			if (returnid != "") {
				URL = "./search-"+val+"byyear", 
				DATA = {"returnid" : returnid,"assYear" : assYear}
			} else if (owner != "") {
				URL = "./search-"+val+"byyearowner", 
				DATA = {"owner" : owner,"assYear" : assYear}
			} else {
				alert("Please enter return id.")
				$('#retid').focus();
				$('#refBtn').hide();
				$('#subBtn').show();
			}

		}

		else if (owner != "" && assYear == "") {
			URL = "./search-"+val+"byowner", 
			DATA = {
				"owner" : owner
			}

		}
			

		$.ajax({
					url : URL,
					data : DATA,
					type : 'POST',
					success : function(result) {
//console.log(result)
						if (result.length > 0) {
							$('#tbl-tr').show();
							var content = "<div class='col-xs-12 col-sm-12 col-md-12 col-lg-12 well no-padding'>\
<section><center><table class='table table-bordered table-striped'><thead><tr><th>SR.NO.</th><th>RETURNID</th><th>PREVIOUS-RETURNID</th><th>NEW PT-ID</th><th>ASS-YEAR</th><th>TAX-PAID</th><th>OWNER/FATHER/MOB(NAME) </th><th>COLONY</th><th>ADDRESS</th><th>STATUS</th><th>SHOW</th></tr></thead><tbody>";
							var count = 1;
							var response = '';
							$.each(result, function(idx, obj) {
								var RETURNID = obj.returnid;
								var PREVRETURNID = obj.previous_returnid;
								var NEWPPID = obj.new_propertyid;
								var YEAR = obj.session;
								var OWNER = obj.owner;
								var ADDRESS = obj.floor;
								var PAYMENT = obj.taxamt;
								var COLONY = obj.colony;
								var STATUS = obj.status;
								var SHOW = "<a href='https://mseva.lgpunjab.gov.in/employee/'>Click</a>";
								

								content = content + "<tr><td>" + (count++)
										+ "</td><td>" + RETURNID + "</td>"
										+ "</td><td>" + PREVRETURNID
										+ "</td><td>" + NEWPPID + "</td><td>"
										+ YEAR + "</td><td>" + PAYMENT
										+ "</td><td>" + OWNER + "</td><td>"
										+ COLONY + "</td><td>" + ADDRESS
										+ "</td><td>" + STATUS + "</td>"
										+ "<td>" + SHOW + "</td></tr>";
//										+ "<td><div style='display: none;' id='refBtn"+count+"'><i class='fa fa-cog fa-spin fa-3x fa-fw'></i></div><button type='button' class='btn btn-primary' id='hisBtn"+count+"' onclick=\"getViewHistory('"+RETURNID+"','"+YEAR+"','"+val+"', "+count+")\">HISTORY</button></td></tr>";
							});
							content = content
									+ "</tbody></table></section></center></div>";
							$('#tbl-tr').html(content);
							$('#refBtn').hide();
							$('#subBtn').show();
							$('#error-msg').hide();
						} else {
							$('#error-msg').show();
							$('#refBtn').hide();
							$('#subBtn').show();
							$('#tbl-tr').hide();
						}
					}
				});
	/* } */
		
	}else {
		alert('please enter atleast one record!')
		$('#retid').focus();
	}
}



function getViewHistory(returnid, session, val, counts)
{
	$('#refBtn'+counts).show();
	$('#hisBtn'+counts).hide();
	$.ajax({
		url : "./search-"+val+"viewbysessionrid",
		data : {"session":session, "returnid":returnid},
		type : 'POST',
		success : function(result) {

			if (result.length > 0) {
				
				$('#tbl-tr').show();
				var content = "<div class='col-xs-12 col-sm-12 col-md-12 col-lg-12 well no-padding'>\
<section><center><h2>PROPERTY HISTORY</h2><table class='table table-bordered table-striped'><thead><tr><th>SR.NO.</th><th>RETURNID</th><th>PREVIOUS-RETURNID</th><th>NEW PT-ID</th><th>ASS-YEAR</th><th>TAX-PAID</th><th>OWNER/FATHER/MOB(NAME) </th><th>COLONY</th><th>ADDRESS</th><th>STATUS</th><th>SHOW</th>" +
		"</tr></thead><tbody>";
				var count = 1;
				var response = '';
				$.each(result, function(idx, obj) {
					var RETURNID = obj.returnid;
					var PREVRETURNID = obj.previous_returnid;
					var NEWPPID = obj.new_propertyid;
					var YEAR = obj.session;
					var OWNER = obj.owner;
					var ADDRESS = obj.floor;
					var PAYMENT = obj.taxamt;
					var COLONY = obj.colony;
					var STATUS = obj.status;
					var SHOW = "Click";
					

					content = content + "<tr><td>" + (count++)+"</td>"
							+ "<td>" + RETURNID + "</td>"
							+ "<td>" + PREVRETURNID+ "</td>"
							+ "<td>" + NEWPPID + "</td>"
							+ "<td>"+ YEAR + "</td>" 
							+ "<td>"+PAYMENT+ "</td>"
							+ "<td>" + OWNER + "</td>"
							+ "<td>" +COLONY + "</td>"
							+ "<td>" + ADDRESS + "</td>"
							+ "<td>" + STATUS + "</td>"
							+ "<td>" + SHOW + "</td> </tr>";
				});
				content = content
						+ "</tbody></table></section></center></div>";
				$('#tbl-tr').html(content);
			} else {
				$('#refBtn'+counts).hide();
				$('#hisBtn'+counts).show();
			}
		}
	});
}

