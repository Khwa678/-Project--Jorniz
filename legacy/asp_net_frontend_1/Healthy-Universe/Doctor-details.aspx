<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Doctor-details.aspx.cs" Inherits="Doctor_details" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
      <main id="content" role="main">
            <!-- breadcrumb -->
          <%--  <p><asp:Label ID="Label10" runat="server" Text="Label"></asp:Label></p>--%>
            <!-- End breadcrumb -->
            <div class="container">

                  <div class="py-2" style="margin-bottom: 0px !important;margin-top: 10px !important;">
                <div class="container">
                    <div class="flex-center-between d-block d-md-flex">
                        <div class="mb-3 mb-md-0"><a href="Default.aspx" style="color:#000 !important">Home</a> - <a href="Doctor.aspx" >Explore Doctor</a> - <asp:Label ID="Label5" style="font-weight:bold !important;" runat="server"></asp:Label></div>
                      
                    </div>
                </div>
              </div>

                   <hr style="
    margin-top: 0.2rem !important;
" />
                <!-- Single Product Body -->
                <div class="mb-xl-14 mb-6" style="margin-top:20px !important;margin-bottom:2rem !important;">
                    <div class="row">
                        <div class="col-md-4 mb-4 mb-md-0">
             
<div class="container" style="padding:0px !important;">
    <link href="https://www.jqueryscript.net/css/jquerysctipttop.css" rel="stylesheet" type="text/css" />
    <!--<script src="js/jquery-1.9.1.min.js"></script>-->
    <script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/imagesloaded@4/imagesloaded.pkgd.min.js"></script>
    <script src="jquery.exzoom.js"></script>
    <link href="jquery.exzoom.css" rel="stylesheet" type="text/css" />
    <style>
        #exzoom {
            width: auto;
            height:300px !important;
            margin:5px !important;
            padding:5px !important;
        }
      
        .exzoom_img_ul_outer {
            border: none !important;
        }
    </style>
   
<div class="exzoom hidden" id="exzoom">
    <div class="exzoom_img_box" style="background:none !important;background-color:white !important;">
        <ul class='exzoom_img_ul'>
           <li id="img1" runat="server" style="height:300px !important"><asp:Image ID="Image1" style="height:300px !important" runat="server" /></li>                   
                       </ul>       
                  </div>
               </div>                                                                          
           </div>               
        </div>
  <div class="col-md-8 mb-md-8 mb-lg-0">
                            <div class="mb-2" style="margin-left:30px !important;">
                                <div class="border-bottom mb-3 pb-md-1 pb-3" style="padding-bottom:1rem !important;">

                                    <p id="failed" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;margin-bottom:10px !important;margin-top:5px !important;"><b>Sorry!</b> Some Error Occoured. Please Try Again Later!</p>
                                    <h2 class="font-size-25 text-lh-1dot2" style="margin-top:10px !important;font-size:18px !important;text-transform:uppercase !important;letter-spacing:0.5px !important;font-weight:bold !important;"><asp:Label ID="Label3" runat="server"></asp:Label></h2>
                                   
                                    <div class="d-md-flex align-items-center">
                                        
                                        <div class="ml-md-3 text-gray-9 font-size-14" style="margin-left:0rem !important;"> <strong>UID</strong>: DID000<asp:Label ID="Label6" runat="server"></asp:Label><asp:Label ID="Label9" style="display:none !important;" runat="server"></asp:Label>                                            
                                        </div>                                   
                                    </div>
                                       <p><asp:Label ID="Label51" runat="server"></asp:Label></p>
                                    <div class="social-share" style="margin-top:15px !important;">
													
													<div class="wrap-content">
														 <!-- AddToAny BEGIN -->
<div class="a2a_kit a2a_kit_size_32 a2a_default_style">
<a class="a2a_dd" href="https://www.addtoany.com/share"></a>
<a class="a2a_button_facebook"></a>
<a class="a2a_button_twitter"></a>
<a class="a2a_button_email"></a>
<a class="a2a_button_whatsapp"></a>
<a class="a2a_button_google_gmail"></a>
<%--<a class="a2a_button_blinklist"></a>
<a class="a2a_button_blogger"></a>--%>
<a class="a2a_button_copy_link"></a>
<a class="a2a_button_facebook_messenger"></a>
<%--<a class="a2a_button_google_bookmarks"></a>--%>
<%--<a class="a2a_button_outlook_com"></a>--%>
</div>
<script async src="https://static.addtoany.com/menu/page.js"></script>
<!-- AddToAny END -->
													</div>
												</div>
                                </div>
                                <p><asp:Label ID="Label4" runat="server"></asp:Label></p>
                              
                                <div class="mb-4" style="margin-bottom:15px !important;">
                                    <div class="d-flex align-items-baseline">
                                     
                                      <h6 style="color:cadetblue"> <strong style="font-size: 21px !important;font-weight:500">Consultation fee :&ensp; </strong></h6><ins style="font-weight:bolder !important;font-size: 1.3rem !important;" class="font-size-22 text-decoration-none"><asp:Label ID="Label2" runat="server"></asp:Label> INR</ins>

                                    </div>
                                </div>
                               
                  
         
                               
                                <div id="buyselection" runat="server" style="margin-bottom:10px !important;margin-top:15px !important;">                                 
<asp:Button ID="Button2" runat="server" style="background: #6495ED !important;border-radius: 0rem !important;color: #fff;border: #6495ED !important;"  class="btn px-5 btn-outline-dark transition-3d-hover" OnClick="Button2_Click" Text="Book Now"></asp:Button>
                                </div>

                      
                                
                            </div>
                        </div>
                    
                    </div>
                </div>
                <!-- End Single Product Body -->
                   <div class="col-md-12 mb-md-12">
                              <div class="container mb-8 mb-lg-0" style=" margin-bottom: 1.5rem !important;">
                <div style=" margin-bottom: 1.5rem !important;">
                   
                                        <div class="card-body">
                                          <style>
#customers {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

#customers td, #customers th {
  border: 1px solid #ddd;
  padding: 8px;
}

#customers tr:nth-child(even){background-color: #f2f2f2;}

#customers tr:hover {background-color: #ddd;}

#customers th {
 padding-top: 0px;
    padding-bottom: 0px;
    text-align: left;
    background-color: cornflowerblue;
    color: white;
}
</style>



<table id="customers">
 
    
  <tr>
    <th><b>Doctor Basic Details </b></th>
    <th></th>
   
  </tr>
  <tr>
    <td><b>Email Address </b></td>
    <td><asp:Label ID="Label52" runat="server" ></asp:Label></td>
   
  </tr>
  <tr>
    <td><b>Qualification </b></td>
    <td><asp:Label ID="Label53" runat="server" ></asp:Label></td>
   
  </tr>
 
     <tr>
    <td><b>Profession </b></td>
      <td><asp:Label ID="Label54" runat="server" ></asp:Label></td>
   
  </tr>

     <tr>
    <td><b>Experience</b></td>
      <td><asp:Label ID="Label55" runat="server" ></asp:Label></td>
   
  </tr>

     <tr>
    <td><b>Clinic address</b></td>
     <td><asp:Label ID="Label56" runat="server" ></asp:Label></td>
   
  </tr>

   
</table>
                                        </div>
                                    </div>
                           
            </div>
                              
                        </div>
            </div>
        </main>
</asp:Content>

