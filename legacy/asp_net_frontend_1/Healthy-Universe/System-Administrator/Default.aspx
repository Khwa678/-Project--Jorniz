<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="System_Administrator_Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="UTF-8">
    <title>System Administration | Healthy Universe</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="Images/hand-with-pen.png">
    <link rel="stylesheet" href="font/iconsmind/style.css" />
    <link rel="stylesheet" href="font/simple-line-icons/css/simple-line-icons.css" />

    <link rel="stylesheet" href="css/vendor/bootstrap-stars.css" />
    <link rel="stylesheet" href="css/vendor/bootstrap.min.css" />
    <link rel="stylesheet" href="css/vendor/owl.carousel.min.css" />
    <link rel="stylesheet" href="css/vendor/bootstrap-float-label.min.css" />
    <link rel="stylesheet" href="css/vendor/bootstrap-stars.css" />
    <link rel="stylesheet" href="css/main.css" />
      <style>
        .theme-colors .theme-button {
            display: none !important;
        }
      </style>
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
<body class="show-spinner" style="padding-bottom:0px !important;">
    <form id="form1" runat="server" autocomplete="off">
        <div class="landing-page">
        
        <div class="main-container" style="background:none !important;background-image:url(Images/homepage.jpg) !important;height:100% !important;min-height:650px !important;">
            <nav class="landing-page-nav" style="background:none !important;background-color:transparent !important;">
                <div class="container d-flex align-items-center justify-content-between" style="height:60px !important;">
                    <a class="navbar-logo pull-left" href="#">
                        <img style="height:50px !important;width:auto;margin:auto !important;" src="Images/logo-light.png" />
                    </a>
                    <ul class="navbar-nav d-none d-lg-flex flex-row">
                        <li class="nav-item pl-2">
                            <a class="btn btn-dark btn-sm pr-4 pl-4" href="https://healthyuniverse.co.in/Default.aspx">Return To Website</a>
                        </li>
                    </ul>
                </div>
            </nav>
            <div class="content-container">
                <div class="section" style="height:100% !important;background-image:none !important;margin-bottom:0px !important;">
                    <div class="container">
                        <div class="row home-row mb-0" style="padding-top: 100px !important;">
                            <div class="col-12 col-lg-6 col-xl-6 col-md-12">
                                <div class="home-text">
                                    <div class="display-1" style="font-size:21px !important;font-weight:bold !important;line-height:30px !important;margin-bottom: 0.2em !important;color:black !important;">
                                        System Administration v1.1
                                    </div>
                                    <p class="white mb-5" style="color:black !important;margin-bottom:1rem !important;">
                                        Please use your registered account credentials to login.<br/>
                                        If not authorised, please turn around using <a href="https://healthyuniverse.co.in/Default.aspx" class="white-underline-link" style="color:darkblue !important;">this link</a>.
                                    </p>


                                    <div class="dark-background">
                                        <label class="form-group" style="width: 100% !important;">
                                        <asp:TextBox ID="TextBox1" class="form-control" runat="server" placeholder="Reg. Email Address" TextMode="Email" required="true"></asp:TextBox>
                                        </label>

                                        <label class="form-group" style="width: 100% !important;">
                                            <asp:TextBox ID="TextBox2" runat="server" class="form-control" placeholder="Password" TextMode="Password" required="true"></asp:TextBox>
                                        </label>

                                        <asp:Button ID="Button1" class="btn btn-primary btn-xl mt-4" style="margin-top:0.5rem !important;border-radius:3px !important;" OnClick="Button1_Click" runat="server" Text="Continue to Dashboard" />
                                      
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
         <script src="js/vendor/jquery-3.3.1.min.js"></script>
    <script src="js/vendor/bootstrap.bundle.min.js"></script>
    <script src="js/vendor/owl.carousel.min.js"></script>
    <script src="js/vendor/jquery.barrating.min.js"></script>
    <script src="js/vendor/jquery.barrating.min.js"></script>
    <script src="js/vendor/landing-page/headroom.min.js"></script>
    <script src="js/vendor/landing-page/jQuery.headroom.js"></script>
    <script src="js/vendor/landing-page/jquery.scrollTo.min.js"></script>
    <script src="js/dore.scripts.landingpage.js"></script>
    <script src="js/scripts.js"></script>
    </form>
</body>
</html>
