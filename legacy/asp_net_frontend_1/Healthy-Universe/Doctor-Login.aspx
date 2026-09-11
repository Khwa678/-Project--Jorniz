<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Doctor-Login.aspx.cs" Inherits="Doctor_Login" %>

<!DOCTYPE html>


<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1.0, shrink-to-fit=no"/>
<link href="images/favicon.png" rel="icon" />
<title>Doctor Login | Healthy Universe.</title>

<!-- Web Fonts
======================== -->
<link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Poppins:100,200,300,400,500,600,700,800,900' type='text/css'/>

<!-- Stylesheet
======================== -->
<link rel="stylesheet" type="text/css" href="Vendor/bootstrap/css/bootstrap.min.css" />
<link rel="stylesheet" type="text/css" href="Vendor/font-awesome/css/all.min.css" />
<link rel="stylesheet" type="text/css" href="Vendor/magnific-popup/magnific-popup.min.css" />
<link rel="stylesheet" type="text/css" href="css/stylesheet.css" />

    <script type = "text/javascript">
       function DisableButtons() {
           var inputs = document.getElementsByTagName("INPUT");
           for (var i in inputs) {
               if (inputs[i].type == "button" || inputs[i].type == "submit") {
                   inputs[i].disabled = true;
               }
           }
       }
       window.onbeforeunload = DisableButtons;
    </script>

</head>
<body>
    <form id="form1" runat="server">
        <!-- Document Wrapper
=============================== -->
<div id="main-wrapper"> 
  
  <!-- Header -->
  <header id="header"> 
    <!-- Navbar -->
    <nav class="primary-menu navbar navbar-expand-md navbar-text-light bg-transparent border-bottom-0">
      <div class="container position-relative">
        <div class="col-auto col-lg-2"> 
          <!-- Logo --> 
          <a class="logo" href="Default.aspx"> <img src="images/logo1.png" style="height:90px !important;width:auto !important;margin-top:10px !important;" alt="Company Logo"/> </a> 
          <!-- Logo End --> 
        </div>
 
        <div class="col-auto col-lg-2 d-flex justify-content-end">
          <ul class="social-icons social-icons-light">
         <%--   <li class="social-icons-youtube"><a data-bs-toggle="tooltip" href="http://www.youtube.com/" target="_blank" title="Youtube"><i class="fab fa-youtube"></i></a></li>--%>
            <li class="social-icons-facebook"><a data-bs-toggle="tooltip" href="http://www.facebook.com/" target="_blank" title="Facebook"><i class="fab fa-facebook"></i></a></li>
            <li class="social-icons-instagram"><a data-bs-toggle="tooltip" href="http://www.instagram.com/" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a></li>
          </ul>
        </div>
      </div>
    </nav>
    <!-- Navbar End --> 
  </header>
  <!-- Header End -->
  
  <div class="container-fluid px-0">
    <section class="hero-wrap">
      <div class="hero-mask opacity-1 bg-dark"></div>
      <div class="hero-bg" style="background-image:url(images/doctor.png) !important;"></div>
      <div class="hero-content min-vh-100 d-flex flex-column">
        <div class="container py-5 px-4 px-lg-5 my-auto">
          <div class="row py-5 py-sm-4">
            <div class="col-1 text-center mx-auto">
            
            </div>
            <div class="col-md-8 col-lg-6 col-xl-5 mx-auto text-center" style="margin-right: revert !important;margin-left: auto!important;box-shadow: 10px 10px 10px;background: cornflowerblue;padding: 40px;border: 1px solid;">
                  <h1 class="text-2 bg-primary d-inline-block fw-700 rounded px-3 py-2 mb-4" style="color:white !important;background-color:red !important;margin-bottom: 0.6rem!important;">Welcome Back!</h1>
              <h2 class="text-5 text-white fw-700 mb-2" style="font-weight:600 !important;text-transform:uppercase !important;">Doctor Login Dashboard</h2>
              <p class="text-2 text-light mb-3">Use the following form to continue to your dedicated Doctor dashboard.</p>
              <!-- Subscribe Form -->
			  <div class="subscribe-form">
			  
                <div id="failed" runat="server" class="alert alert-danger alert-dismissible fade show mb-0" role="alert" style="margin-bottom:20px !important;font-size:0.8rem !important;">
                                <strong>Operation failed!</strong> Please try again later.
                                
                 </div>
                  <div class="form-dark">
                <div class="row">
                   <%-- <p style="color:#ffffff !important;font-size: 13px;">
                    <b>Login Note:</b> Please remove the suffux 'AL3020' before Login for Id.</p>--%>
                   <div class="col-sm-12 col-md-12">
                                     
                                     <asp:TextBox ID="TextBox3" class="form-control border-2" style="margin-bottom:10px !important;background-color:white !important;color:black !important;padding: 0.6rem !important;font-size:14px !important;" placeholder="Enter Email Address.*" runat="server"></asp:TextBox>
                                        </div>
                                   
                               
                     <div class="col-sm-12 col-md-12">
                    <asp:TextBox ID="TextBox6" class="form-control border-2" style="margin-bottom:10px !important;background-color:white !important;color:black !important;padding: 0.6rem !important;font-size:14px !important;" placeholder="Password*"  TextMode="Password" runat="server"></asp:TextBox>
                </div>
                  </div> 
               </div>
                <div class="d-grid mt-2" style="margin-top:0.5em !important;">
                    <asp:Button ID="Button1" class="btn btn-primary" style="width:100% !important;text-decoration:none !important;padding: 0.61rem 2rem !important;font-size: 1rem !important;" runat="server" OnClick="Button1_Click" Text="Continue To Dashboard" />
                </div>
<asp:Button ID="Button2" OnClick="Button2_Click" runat="server" Text="Forget Password" style="float: right;margin-top: 10px; color: #fff;padding: 5px;text-decoration:underline !important;border: none;background: none;" />
              </div>
                
			  </div>
              <!-- Subscribe End --> 
            </div>
          </div>
        </div>
       
         </section>
  </div>
        <!-- Footer -->
       <footer class="container pt-2" style="text-align:center !important;background-color:black !important;max-width:none !important;">
          <p class="text-1 text-light mb-2 fw-600">Copyright © 2023 All Rights Reserved</p>
        </footer>
     </div>
<!-- Document Wrapper End --> 


<!-- Script -->
<script src="Vendor/jquery/jquery.min.js"></script>
<script src="Vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="Vendor/magnific-popup/jquery.magnific-popup.min.js"></script>
<script src="Vendor/jquery-form/jquery.form.min.js"></script>
<script src="Vendor/jquery-validation/jquery.validate.min.js"></script>
<script src="js/theme.js"></script>
    </form>
</body>
</html>