<%@ Page Title="Healthy Universe | 	Health & Fitness Products | Diagnostic Services" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <!-- Slider Section -->

             <div class="mb-4">
                <div class="bg-img-hero">
                    <div class="container" style="max-width:100% !important;padding:0px !important;">
                        <div class="js-slick-carousel u-slick" data-autoplay="true"
                                    data-speed="12000"
                            data-pagi-classes="text-center position-absolute right-0 bottom-0 left-0 u-slick__pagination u-slick__pagination--long justify-content-center mb-3 mb-md-4">
                       
                            <asp:Repeater ID="Repeater1" runat="server">
                                <ItemTemplate>

                         <div class="js-slide">
                                   <asp:linkbutton id="Linkbutton3" style="text-decoration:none !important;" runat="server" PostBackUrl='<%#Eval("Title")%>'>
                                    <asp:Image ID="imgPhoto" style="width:100% !important;height:auto !important;margin:auto !important;" runat="server" ImageUrl='<%#Bind("Path1") %>' />
                                   </asp:linkbutton>
                                       </div>   
                                 </ItemTemplate>
                             </asp:Repeater>
                        </div>
                    </div>
                </div>
            </div>
            <!-- End Slider Section -->

            <div class="container">
                 <div class="d-flex justify-content-between border-bottom border-color-1 flex-md-nowrap flex-wrap border-sm-bottom-0" style="border:none !important;">
                        <h3 class="section-title section-title__full mb-0 pb-2 font-size-15" style="font-weight:bold !important;margin-bottom:15px !important;">Explore By Departments</h3>
                    </div>
            </div>
           <!-- Brand Carousel -->
            <div class="container mb-8" style="margin-bottom: 0.5rem !important;">
             
                    <ul class="row list-unstyled products-group no-gutters" style="margin-top:15px !important;">

                           <asp:Repeater ID="Repeater2" runat="server">
                                                <ItemTemplate>
                               
                               <li class="col-4 col-wd-3 col-md-3" style="text-align:left !important;">

                              <%--  <asp:linkbutton id="Linkbutton1" runat="server" PostBackUrl='<%#%>'>--%>
                                <div class="js-slide" style="padding-left:5px !important;padding-right:5px !important;text-align:center !important;">
                                <asp:Image ID="imgPhoto" lass="img-fluid m-auto" style="width:100% !important;height:auto !important;margin:auto !important;margin-bottom:0px !important;border-radius:8px !important;" runat="server" ImageUrl='<%#Bind("Path1") %>' />
                                <p style="line-height:1.1 !important;margin-top:10px !important;margin-bottom: 1rem;text-align:left !important;"><asp:Label ID="Label1" style="font-weight:bold !important;color:black !important;font-size:13px !important;line-height:16px !important;" Text='<%# Eval("Title") %>' runat="server"></asp:Label></p>
                                </div>
                              <%--  </asp:linkbutton>--%>

                                   </li>
                                               </ItemTemplate>
                           </asp:Repeater>

                    </ul>
              
            </div>

    
                                             
                                         
  

            <!-- End Brand Carousel -->
   <%-- Free Consultation Form Start--%>

     




    <hr/>

    <div class="container" style="margin-top:20px !important;margin-bottom:20px !important;">
              
               
                <!-- Banner 2 columns -->
             <div class="mb-8"  style="margin-bottom: 0rem !important;">
                   
                    <div class="row">


                          <asp:Repeater ID="Repeater4" runat="server">
                                                <ItemTemplate>
                                <div  class="col-12 col-wd-4 col-md-4">
                                   
                                              <asp:linkbutton  id="Linkbutton1"  runat="server" PostBackUrl='<%#Eval("Title")%>'>
                                                  <asp:Image style="width:100% !important;height:auto !important;padding:0px !important;margin:5px 10px !important;border:none !important;border-radius:8px !important;" ID="imgPhoto" class="img-fluid" runat="server" ImageUrl='<%#Bind("Path1") %>' />
                                              </asp:linkbutton>
                                       
                                </div>
                                                   
                                     </ItemTemplate>
                                     </asp:Repeater>


                      
                    </div>

                 

                </div>
                <!-- End Banner 2 columns -->
            </div>
           <div class="container">
                 <div class="d-flex justify-content-between border-bottom border-color-1 flex-md-nowrap flex-wrap border-sm-bottom-0" style="border:none !important;">
                        <h3 class="section-title section-title__full mb-0 pb-2 font-size-15" style="font-weight:bold !important;margin-bottom:15px !important;">Explore By Category</h3>
                    </div>
            </div>
           <!-- Brand Carousel -->
            <div class="container mb-8" style="margin-bottom: 0.5rem !important;">
             
                    <ul class="row list-unstyled products-group no-gutters" style="margin-top:15px !important;">

                           <asp:Repeater ID="Repeater5" runat="server">
                                                <ItemTemplate>
                               
                               <li class="col-4 col-wd-3 col-md-2" style="text-align:left !important;">

                              <%--  <asp:linkbutton id="Linkbutton1" runat="server" PostBackUrl='<%#%>'>--%>
                                <div class="js-slide" style="padding-left:5px !important;padding-right:5px !important;text-align:center !important;">
                                <asp:Image ID="imgPhoto" lass="img-fluid m-auto" style="width:100% !important;height:auto !important;margin:auto !important;margin-bottom:0px !important;border-radius:8px !important;" runat="server" ImageUrl='<%#Bind("Path1") %>' />
                                <p style="line-height:1.1 !important;margin-top:10px !important;margin-bottom: 1rem;text-align:left !important;"><asp:Label ID="Label1" style="font-weight:bold !important;color:black !important;font-size:13px !important;line-height:16px !important;" Text='<%# Eval("Title") %>' runat="server"></asp:Label></p>
                                </div>
                                <%--</asp:linkbutton>--%>

                                   </li>
                                               </ItemTemplate>
                           </asp:Repeater>

                    </ul>
              
            </div>

   <%--  <div class="container">
                 <div class="d-flex justify-content-between border-bottom border-color-1 flex-md-nowrap flex-wrap border-sm-bottom-0" style="border:none !important;">
                        <h3 class="section-title section-title__full mb-0 pb-2 font-size-15" style="font-weight:bold !important;margin-bottom:15px !important;">For Our Readers</h3>
                    </div>
            </div>
         <div class="container" style="margin-top:0px !important;">
              
              
                <!-- Banner 2 columns -->
             <div class="mb-8"  style="margin-bottom:0rem !important;">
                   
                    <div class="row">
       
           <asp:Repeater ID="Repeater3" runat="server">
           <ItemTemplate>
                  
                        
                <div class="col-12 col-wd-4 col-md-4 mb-5">
                    <div class="card flex-row listing-card-container">
                        <div class="w-40 position-relative">
                            <asp:LinkButton id="Linkbutton3" style="text-decoration:none !important;" runat="server" PostBackUrl='<%# GetRouteUrl("RouteForBlogs", new {id = Eval("ID"), Title= GetTitle(Eval("MetaUrl"))})%>'>
                                  <asp:Image ID="imgPhoto" class="card-img-left" style="width:100% !important;height:auto !important;" runat="server" ImageUrl='<%#Bind("Banner") %>' />
                     
                            </asp:LinkButton>
                        </div>
                        <div class="w-60 d-flex" style="background-color:#fafafa !important;">
                            <div class="card-body">
                                <asp:LinkButton id="Linkbutton33" style="text-decoration:none !important;" runat="server" PostBackUrl='<%# GetRouteUrl("RouteForBlogs", new {id = Eval("ID"), Title= GetTitle(Eval("MetaUrl"))})%>'>

                                    <h5 style="font-size: 0.9rem !important;font-weight: bold !important;margin-bottom:0.2rem !important;line-height:1.3 !important;">
                                       <asp:Label ID="Label2" Text='<%# Eval("Title") %>' runat="server"></asp:Label>
                                    </h5>

                                </asp:LinkButton>
                                <p style="margin-bottom:0.5rem !important;">
                                    <asp:Label ID="Label3" Text='<%# Eval("Qdesc") %>' runat="server"></asp:Label>
                                </p>

                             <%--   <asp:LinkButton id="Linkbutton1" style="float:right !important;text-decoration:none !important;padding:3px 7px !important;background-color:black !important;color:white !important;border-radius:3px !important;" runat="server" PostBackUrl='<%#"Blog-Details.aspx?Id="+Eval("Id")%>'>Read Full Article</asp:LinkButton>--%>
                                          <%-- <p class="badge badge-pill badge-theme-1 position-absolute badge-top-left"><asp:Label ID="Label1" Text='<%# Eval("Dated", "{0:dddd, dd MMMM yyyy}") %>' runat="server"></asp:Label></p>--%>
                               <%--   <h5 style="font-size: 0.9rem !important;font-weight: bold !important;margin-bottom:0.2rem !important;line-height:1.3 !important;">
                                        <i class="iconsminds-user" style="font-weight:bold !important;" title="Visitor Count"></i> <asp:Label ID="Label6" Text='<%# Eval("Views") %>' runat="server"></asp:Label>
                                          &nbsp; <i class="iconsminds-pen-2"  style="font-weight:bold !important;" title="Total Comments"></i> <asp:Label ID="Label7" Text='<%# Eval("Comments") %>' runat="server"></asp:Label>
                                    </h5>--%>
                         <%--   </div>
                        </div>
                    </div>
                </div>

               </ItemTemplate>
     </asp:Repeater>
           </div>
                </div>
                <!-- End Banner 2 columns -->
            </div>
     --%>
    
</asp:Content>

