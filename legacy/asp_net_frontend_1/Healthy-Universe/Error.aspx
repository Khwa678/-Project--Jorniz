<%@ Page Title="Error Encountered | 404 Page Not Found" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Error.aspx.cs" Inherits="Error" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
     <main id="content" role="main">
         <div class="container">

              <div class="py-2" style="margin-bottom: 0px !important;margin-top: 10px !important;">
                <div class="container" style="padding-left:0px !important;">
                    <div class="d-block d-md-flex">
                        <div class="mb-3 mb-md-0" style="margin-bottom:0rem !important;"><a href="Default.aspx" class="font-weight-bold text-gray-90">Home</a> - Page Not Found</div>
                    </div>
                </div>
              </div>
              <hr style="
    margin-top: 0.2rem !important;
" />
             <div class="row" style="text-align:center !important;margin-bottom:25px !important;">
                    <div class="col-md-8 mb-4 mb-md-0" style="float:none !important;margin:auto !important;vertical-align:middle !important;">
                        <div class="card mb-3 border-0 text-center rounded-0">
                     <img style="width:100% !important;height:auto !important;margin:auto !important;" src="Images/404.png" />
                        </div>
                         <a class="bg-primary rounded-lg" style="border:none !important;border-radius:0px !important;padding:10px 15px !important;color:black !important;margin-left:15px !important;margin-bottom:15px !important;" href="Default.aspx" runat="server"><i class="fa fa-home"></i> &nbsp;Home</a>
                  <a class="bg-dark rounded-lg" style="border:none !important;border-radius:0px !important;padding:10px 15px !important;color:white !important;margin-bottom:15px !important;" href="#" runat="server"><i class="fa fa-users"></i> &nbsp;Support</a>
                    </div>
                </div>

             
               
            </div>
         </main>
</asp:Content>

