<%@ Page Title="Category | Healthy Universe | Health & Fitness Products | Diagnostic Services  " Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Category.aspx.cs" Inherits="Category" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
          <div class="py-2" style="margin-bottom:0px !important;margin-top: 10px !important;">
                <div class="container" style="padding-left:0px !important;">
                    <div class="flex-center-between d-block d-md-flex">
                        <div class="mb-3 mb-md-0">                
                       <p style="margin-bottom:0em !important">
                            <a href="Default.aspx"><i class="fa fa-home"></i></a>
                            <a href="Search.aspx"> / <b>Explore</b></a> /
                           <span style="color:#000 !important">Displaying All Category</span>
                            </p>
                       </div>
                                                    </div>

                                                </div>
                            </div>
         <div class="container" style="margin-top: 40px !important;">
                 <div class="d-flex justify-content-between border-bottom border-color-1 flex-md-nowrap flex-wrap border-sm-bottom-0" style="border:none !important;">
                        <h3 class="section-title section-title__full mb-0 pb-2 font-size-17" style="font-weight:bold !important;margin-bottom:15px !important;">Explore By Category</h3>
                 
                    </div>
               
              
            </div>
           <!-- Brand Carousel -->

          <div class="container mb-8" style="margin-bottom: 0.5rem !important;">
             
                    <ul class="row list-unstyled products-group no-gutters" style="margin-top:15px !important;">

                           <asp:Repeater ID="Repeater3" runat="server">
                                                <ItemTemplate>
                               
                               <li class="col-4 col-wd-2 col-md-2">
                            <asp:linkbutton id="Linkbutton1" runat="server" PostBackUrl='<%#"~/subcategory.aspx?subcategoryid="+Eval("Id")%>'>
                                <div class="js-slide" style="padding-left:20px !important;padding-right:20px !important;text-align:center !important;">
                                <asp:Image ID="imgPhoto" lass="img-fluid m-auto" style="width:100% !important;height:auto !important;margin:auto !important;border-radius:3% !important;margin-bottom:15px !important;" runat="server" ImageUrl='<%#Bind("Path1") %>' />
                                <p style="line-height:1.4 !important;"><asp:Label ID="Label1" style="font-weight:bold !important;color:black !important;font-size:14px !important;line-height:16px !important;" Text='<%# Eval("Title") %>' runat="server"></asp:Label></p>
                                </div>
                                </asp:linkbutton>

                                               </ItemTemplate>
                           </asp:Repeater>
                         
                    </ul>
                              
            </div>

</asp:Content>

