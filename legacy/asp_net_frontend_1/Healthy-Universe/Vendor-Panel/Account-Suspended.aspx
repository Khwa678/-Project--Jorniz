<%@ Page Title="" Language="C#" MasterPageFile="~/Vendor-Panel/MasterPage2.master" AutoEventWireup="true" CodeFile="Account-Suspended.aspx.cs" Inherits="Vendor_Panel_Account_Suspended" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <main style="margin-top:70px !important;padding-top:25px !important;">
        <div class="container-fluid">
            <div class="row  ">
                <div class="col-12">
                    <h1 style="margin-bottom:0px !important;padding-bottom:0px !important;font-size:17px !important;"> Your Account is <b>Inactive</b></h1>
                    <nav class="breadcrumb-container d-none d-sm-block d-lg-inline-block" style="float:right !important;margin-top:0px !important;" aria-label="breadcrumb">
                        <ol class="breadcrumb pt-0" style="margin-bottom:0rem !important;padding:0px !important;">
                            <li class="breadcrumb-item active">
                                <b>Member Dashboard</b>
                            </li>
                            <li class="breadcrumb-item">
                                <a href="#">Account Inactive</a>
                            </li>
                        </ol>
                    </nav>
                    
                </div>
                  
                
            </div>
            <hr style="margin-top: 0.5rem !important;margin-bottom: 1.5rem !important;" />
             <div class="row" style="margin-top:20px !important;">
                 
                  <div class="col-md-12 col-lg-12 col-xl-12 mb-4">
                    <div class="card dashboard-progress" style="height:auto !important;text-align:center !important;">
                 
                           <div class="card-body">
                            <img style="width:80% !important;height:auto !important;margin:auto !important;margin-bottom:20px !important;" src="Images/404.jpg" />
                            <h4 style="font-weight:600 !important;">Account requested is Suspended or Permanently Disabled</h4>
                            <p style="margin-bottom:0rem !important;">We regret to inform that your account is inactive - However, the same can be reactivated by Healthy Universe support center. Feel free to contact us on <a href="mailto:info@Healthy Universe.com">Healthy Universe.com</a> & <a href="tel:99182-37424">(+91) 94159-43224</a>. Our dedicated team of experts will help you understyand the reason of deactivation and the process of reactivation in detail.</p>
                           <br/><asp:Button ID="Button1" class="btn btn-dark" OnClick="Button1_Click" style="border-radius:3px !important;padding: 0.5rem 0.8rem !important;background-color:red !important;border:none !important;color:white !important;" runat="server" Text="Secure Logout" />
                        </div>
                    </div>
                </div>
                
                 </div>
          
            
            </div>
    </main>
</asp:Content>

