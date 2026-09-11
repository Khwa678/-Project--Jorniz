<%@ Page Title="Diagnostic Tests | Healthy Universe" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Selected-Tests.aspx.cs" Inherits="Selected_Tests" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">

       <div class="py-2" style="margin-bottom:0px !important;margin-top: 10px !important;">
                <div class="container" style="padding-left:0px !important;">
                    <div class="flex-center-between d-block d-md-flex">
                        <div class="mb-3 mb-md-0">                
                             <p style="margin-bottom:0em !important">
                            <a href="Default.aspx"><i class="fa fa-home"></i></a>
                            <a href="Selected-Tests.aspx"> / <b>Explore</b></a> /
                           <span style="color:#000 !important">Select a Package</span>
                            </p>
                       </div>
                 </div>
           </div>
      </div>
    <hr/>

    <style>
        @media only screen and (max-width: 480px) 
        {  
    body {  max-width: 480px;  }  
   img {
    vertical-align: middle;
    border-style: none;
    width: 100%;
    height: auto;
    margin: auto;
}
        }
       @media only screen and (min-width: 560px) 
        {  
    body {  min-width: 560px;  }  
 img {
    vertical-align: middle;
    border-style: none;
    margin-left: 220px;
}

        } 
   </style>
    
           <!-- Brand Carousel -->
            <div class="container mb-8" style="margin-bottom: 3.5rem !important;">
             
                    <div class="js-slick-carousel u-slick my-1"
                        data-slides-show="8"
                        data-slides-scroll="1"
                        data-arrows-classes="d-none d-lg-inline-block u-slick__arrow-normal u-slick__arrow-centered--y"
                        data-arrow-left-classes="fa fa-angle-left u-slick__arrow-classic-inner--left z-index-9"
                        data-arrow-right-classes="fa fa-angle-right u-slick__arrow-classic-inner--right"
                        data-responsive='[{
                            "breakpoint": 992,
                            "settings": {
                                "slidesToShow": 3
                            }
                        }, {
                            "breakpoint": 768,
                            "settings": {
                                "slidesToShow": 3
                            }
                        }, {
                            "breakpoint": 554,
                            "settings": {
                                "slidesToShow": 3
                            }
                        }]'>

                           <asp:Repeater ID="Repeater5" runat="server">
                                                <ItemTemplate>
                               <asp:linkbutton id="Linkbutton1" runat="server" PostBackUrl='<%#"~/Selected-Tests.aspx?categoryid="+Eval("Id")%>'>
                                <div class="js-slide" style="padding-left:20px !important;padding-right:20px !important;text-align:center !important;">
                                <asp:Image ID="imgPhoto" lass="img-fluid m-auto" style="width:100% !important;height:auto !important;margin:auto !important;margin-bottom:15px !important;border-radius: 50% !important;" runat="server" ImageUrl='<%#Bind("Path1") %>' />
                                   <asp:Label ID="Label1" style="font-weight:bold !important;color:black !important;font-size:11px !important;line-height:11px !important;" Text='<%# Eval("Title") %>' runat="server"></asp:Label>
                                </div>
                                </asp:linkbutton>
                                               </ItemTemplate>
                           </asp:Repeater>

                    </div>
              
            </div>      
            <!-- End Brand Carousel -->

    <div class="container">
        <div class="row">
            <img src="Img/download.png" style="width:100% !important;height:auto !important;margin:auto !important"/>

            </div>

        </div>
    <div class="container">             
                <div class="mb-5" style="margin-bottom:1rem !important;margin-top:1rem !important">
                    <div class="row">
                        <!-- Deal -->
                        
                        <!-- End Deal -->
                        <!-- Tab Prodcut -->
                        <div class="col">
                            <!-- Features Section -->
                            <div class="">
                                <!-- Nav Classic -->
                                <div class="position-relative bg-white text-left z-index-2" style="margin-bottom:2rem;">
                                    <ul class="nav nav-classic nav-tab justify-content-left" id="pills-tab" role="tablist">
                                        <li class="nav-item">
                                            <a class="nav-link active " id="pills-one-example1-tab" data-toggle="pill" href="#pills-one-example1" role="tab" aria-controls="pills-one-example1" aria-selected="true">
                                                <div class="d-md-flex justify-content-md-left align-items-md-left">
                                                    All Diagnostic Tests
                                                </div>
                                            </a>
                                        </li>
                                    </ul>
                                <%--    <div class="input-group">
                                  <asp:DropDownList ID="DropDownList2" OnSelectedIndexChanged="DropDownList2_SelectedIndexChanged" AutoPostBack="true" class="form-control" runat="server"></asp:DropDownList>
                                        </div>--%>
                                </div>
                                <!-- End Nav Classic -->

                                <!-- Tab Content -->
                                <div class="tab-content" id="pills-tabContent">
                                    <div class="tab-pane fade pt-2 show active" id="pills-one-example1" role="tabpanel" aria-labelledby="pills-one-example1-tab">
                                        <ul class="row list-unstyled products-group no-gutters">


                                            <asp:Repeater ID="Repeater3" runat="server" OnItemDataBound="Repeater3_ItemDataBound">
                                                <ItemTemplate>

                                            <li class="col-6 col-wd-3 col-md-3">
                                             
	                                    <div style="padding:5px !important;margin:5px !important;border:solid #f2f2f2 2px !important;min-height:400px !important;">
	                                      
                                            <asp:Label ID="Label1" style="display:none !important;" Text='<%# Eval("Price") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label2" style="display:none !important;" Text='<%# Eval("Price1") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label3" style="display:none !important;" Text='<%# Eval("Quantity") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label4" style="display:none !important;" Text='<%# Eval("Id") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label5" style="display:none !important;" Text='<%# Eval("Weight") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label6" style="display:none !important;" Text='<%# Eval("Title") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label7" style="display:none !important;" Text='<%# Eval("Path1") %>' runat="server"></asp:Label>
                                          
                                           
	                                            <figure style="margin-bottom:12px !important;">    
                                                <span id="discounttag" style="margin-left: 10px !important;font-weight: bold !important; position: absolute !important;background-color: crimson;color: #fff !important;padding: 2px 3px !important;font-size: 8px !important;" runat="server"><asp:Label ID="Label8" runat="server"></asp:Label>% OFF</span>
                                           <asp:linkbutton id="Linkbutton3" href='<%#"Diagnostic.aspx?pid="+Eval("Id")%>' runat="server">
	                                            <asp:Image ID="imgPhoto" style="width:100% !important;height:auto !important;margin:auto !important;" class="lazy" ImageUrl='<%#Bind("Path1") %>' runat="server" />
                                           </asp:linkbutton>
                                                </figure>

                                           <p style="margin-bottom:0rem !important;max-height:40px !important;margin-bottom:0.5rem !important;"> 
                                               <asp:linkbutton id="Linkbutton4" style="font-size: 13px !important;font-family:'Open Sans', sans-serif !important;color: #555 !important;line-height:12px !important;font-weight: 700;" href='<%#"Diagnostic.aspx?pid="+Eval("Id")%>' runat="server">
	                                            <%# Eval("Title").ToString().PadRight(45).Substring(0,45).TrimEnd() %>
	                                             </asp:linkbutton></p>
                                                   <p style="margin: 0px;font-size: 12px;font-weight: 600;">Included<asp:Label ID="Label101" Text='<%# Eval("Weight") %>' runat="server" style="margin: 0px 5px !important"></asp:Label>Tests</p>
                                                     <p style="margin: 0px;font-size: 12px;font-weight: 600;">Get Report Within 24 hours</p>
                                             <div class="text-warning mb-2" style="margin:0px !important">
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                    </div>
                                                     <p style="margin-bottom: 0rem !important;"><span  id="display1" runat="server"><strong style="text-decoration:line-through;color:red !important;font-size:12px !important;margin-right:10px !important;"><asp:Label ID="Label1x" Text='<%# Eval("Price1") %>' runat="server"></asp:Label>₹</strong></span>
                                                         <span style="font-size:15px !important;font-weight:bold !important;color:black !important;"><asp:Label ID="Label1y" Text='<%# Eval("Price") %>' runat="server"></asp:Label>₹</span></p>
                                                       
                                              <asp:linkbutton id="Linkbutton2" href='<%#"Diagnostic.aspx?pid="+Eval("Id")%>' runat="server">
	                                            <p style="width:100% !important;background-color:#ff0000 !important;color:#fff !important;border-radius:10% !important;text-align:center !important;margin-top:25px !important">Book Now</p>
                                           </asp:linkbutton>
	                                     </div>
                                             
                                            </li>

                                                  </ItemTemplate>
                                                </asp:Repeater>
                                        </ul>
                                    </div>
                                </div>
                                <!-- End Tab Content -->
                            </div>
                            <!-- End Features Section -->
                        </div>
                        <!-- End Tab Prodcut -->
                    </div>                  
                </div>
            </div>
</asp:Content>

