//function uploadForm()
//{
//	var frm = $('#createTicketForm');
//
//	 frm.submit(function (e) {
//
//	     e.preventDefault();
//
//	     formData = $("#createTicketForm").serialize()
//	     $.ajax({
//	         type: frm.attr('method'),
//	         url: frm.attr('action'),
//	         headers = {'Accept': 'application/json', 'content-Type':'multipart/form-data'},
//	         data: {formData},
//	         success: function (data) {
//	        	 alert(data);
//	        	 if(data=="login"){
//	        		 window.location.href = "login";
//	        	 }
//	        	 else
//	        		 {
//	        		 $('#errorMsg').html('Ticket Genrate Successfully.')
//	        		 }
//	         },
//	         error: function (data) {
//	        	 window.location.href = "login";
//	         },
//	     });
//	 });	
//}