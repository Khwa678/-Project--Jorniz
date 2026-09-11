<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage2.master" AutoEventWireup="true" CodeFile="Shop-Details.aspx.cs" Inherits="Shop_Details" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <main id="content" role="main">
            <!-- breadcrumb -->
          <%--  <p><asp:Label ID="Label10" runat="server" Text="Label"></asp:Label></p>--%>
            <!-- End breadcrumb -->
            <div class="container">

                  <div class="py-2" style="margin-bottom: 0px !important;margin-top: 10px !important;">
                <div class="container">
                    <div class="flex-center-between d-block d-md-flex">
                        <div class="mb-3 mb-md-0"><a href="Default.aspx" >Home</a> - <a href="Search.aspx">Explore Shop</a> - <asp:Label ID="Label5" style="font-weight:bold !important;" runat="server"></asp:Label></div>
                      
                    </div>
                </div>
              </div>

                   <hr style="
    margin-top: 0.2rem !important;
" />
                <!-- Single Product Body -->
                <div class="mb-xl-14 mb-6" style="margin-top:20px !important;margin-bottom:2rem !important;">
                    <div class="row">
                        <div class="col-md-3 mb-3 mb-md-0">
             
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
            max-width:300px !important;
            height:auto !important;
            margin:5px !important;
            padding:5px !important;
        }
        .hidden {
            display: none;
        }
        .exzoom_img_ul_outer {
            border: none !important;
        }
    </style>
   
<div class="exzoom hidden" id="exzoom">
    <div class="exzoom_img_box" style="background:none !important;background-color:white !important;">
        <ul class='exzoom_img_ul'>
             <li id="img1" runat="server"><asp:Image ID="Image1" runat="server" /></li>
             <li id="img2" runat="server"><asp:Image ID="Image2" runat="server" /></li>
             <li id="img3" runat="server"><asp:Image ID="Image3" runat="server" /></li>
           
        </ul>
       
    </div>
    <div class="exzoom_nav"></div>
    <p class="exzoom_btn">
        <a href="javascript:void(0);" class="exzoom_prev_btn"> < </a>
        <a href="javascript:void(0);" class="exzoom_next_btn"> > </a>
    </p>
</div>
    
</div>

<script type="text/javascript">

    $('.container').imagesLoaded(function () {
        $("#exzoom").exzoom({
            autoPlay: false,
        });
        $("#exzoom").removeClass('hidden')
    });

</script>

                          
                                            
                        </div>
                        <div class="col-md-5 mb-md-5 mb-lg-0">
                            <div class="mb-2" style="margin-left:30px !important;">
                                <div class="border-bottom mb-3 pb-md-1 pb-3" style="padding-bottom:1rem !important;">

                                    <p id="failed" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;margin-bottom:10px !important;margin-top:5px !important;"><b>Sorry!</b> Some Error Occoured. Please Try Again Later!</p>
                                     <p id="success" runat="server" style="padding:5px !important;background-color:green !important;color:white !important;padding-left:15px !important;margin-bottom:10px !important;margin-top:5px !important;"><b>Product Added to cart</b>. <a href="Search.aspx" style="color:white !important;text-decoration:underline !important;">Continue Shopping</a> or <a href="Cart.aspx" style="color:white !important;text-decoration:underline !important;">Review Your Cart</a>.</p>


                                    <h2 class="font-size-25 text-lh-1dot2" style="margin-top:10px !important;font-size:18px !important;text-transform:uppercase !important;letter-spacing:0.5px !important;font-weight:bold !important;"><asp:Label ID="Label3" runat="server"></asp:Label></h2>
                                   
                                    <div class="d-md-flex align-items-center">
                                        
                                        <div class="ml-md-3 text-gray-9 font-size-14" style="margin-left:0rem !important;"><span id="available" runat="server" class="text-green font-weight-bold">In stock</span><span id="notavailable" runat="server" class="text-red font-weight-bold">Out of stock</span> | <strong>UID</strong>: VIF<asp:Label ID="Label6" runat="server"></asp:Label><asp:Label ID="Label9" style="display:none !important;" runat="server"></asp:Label>
                                             
                                        </div>
                                     
                                    </div>
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
                              
                                <div class="mb-4" style="margin-bottom:25px !important;">
                                    <div class="d-flex align-items-baseline">
                                       
                                        <del id="display2" runat="server" style="margin-left: 0rem !important;color:red !important;font-size:16px !important;margin-right: 0.5rem !important;" class="font-size-20 ml-2 text-gray-6"><asp:Label ID="Label1" runat="server"></asp:Label> <i class="fa fa-rupee-sign" style="font-size:13px !important;"></i></del>
                                         <ins style="font-weight:bolder !important;" class="font-size-22 text-decoration-none"><asp:Label ID="Label2" runat="server"></asp:Label> <i class="fa fa-rupee-sign" style="font-size:18px !important;"></i></ins>

                                                                    <span  id="display1" runat="server" style="display:none !important;background-color:#FF4101!important;
font-size:16px !important;font-weight:bold !important;
    line-height: 1.5rem !important;
    width: 3.5rem !important;
    height: 1.5rem !important;border-radius:0% !important;text-align:center !important;color:black !important;text-transform:uppercase !important;margin-left:20px !important;margin-top:-3px !important;color:white !important;" class="item-label bg-rose">Sale</span>
                                    </div>
                                </div>
                               
                  
         
                               
                                <div id="buyselection" runat="server" style="margin-bottom:10px !important;margin-top:15px !important;">
                                   
<asp:Button ID="Button1" runat="server" OnClick="Button1_Click"  class="btn px-5 btn-dark transition-3d-hover" style="border-radius:0rem !important;" Text="Add to Cart"></asp:Button>
<asp:Button ID="Button2" runat="server" style="margin-left:15px !important;color:black !important;border-radius:0rem !important;"  class="btn px-5 btn-outline-dark transition-3d-hover" OnClick="Button2_Click" Text="Buy Now"></asp:Button>
                                </div>

                                 <div id="noselection" runat="server" style="width:100% !important;margin-top:20px !important;">

      <p style="padding:5px 10px !important;border:solid #f2f2f2 2px !important;margin-bottom: .5rem !important;width:100% !important;"><b>Running Out of Stock</b>.<br/>We are Sorry! The product is not available. Please check again later.</p>


                                 </div>

                                 <div id="cartselection" runat="server" style="width:100% !important;margin-top:20px !important;">

      <p style="padding:5px 10px !important;border:solid #f2f2f2 2px !important;margin-bottom: .5rem !important;width:100% !important;"><b>Product added to Cart</b>.<br/> You can <a href="Search.aspx" style="text-decoration:none !important;font-weight:bold !important;">Continue Shopping</a> or <a href="Cart.aspx" style="text-decoration:none !important;font-weight:bold !important;">Proceed To Cart</a> rightaway.</p>


                                 </div>
                                
                            </div>
                        </div>

                         <div class="col-md-4 mb-md-4 mb-lg-0">
                            <div class="mb-2 position-relative">
                                 
                                    <div class="d-flex justify-content-between border-bottom border-color-1 flex-md-nowrap flex-wrap border-sm-bottom-0">
                                        <h3 class="section-title section-title__sm mb-0 pb-3 font-size-18">Our Latest Arrivals</h3>
                                    </div>
                                   <ul class="list-unstyled products-group mb-0 overflow-visible">
                                       <asp:Repeater ID="Repeater3" runat="server" OnItemDataBound="Repeater3_ItemDataBound">
                                                <ItemTemplate>                                         
                                               <li class="product-item__list pb-2 mb-2 pb-md-0 mb-md-0">
                                                    <div class="product-item__outer h-100">
                                                        <div class="product-item__inner py-md-3 mx-3 border-bottom row no-gutters" style="padding-top:0.5rem !important;padding-bottom:0.5rem !important;">
                                                            <div class="col-auto product-media-left">
                                          <asp:Label style="display:none !important;" ID="Label8" runat="server"></asp:Label>
                                           <asp:linkbutton id="Linkbutton3" class="max-width-70 d-block" href='<%#"Shop-Details.aspx?pid="+Eval("Id")%>' runat="server">
	                                            <asp:Image ID="imgPhoto" style="width:100% !important;height:auto !important;margin:auto !important;border:solid #f2f2f2 2px !important;" class="img-fluid" ImageUrl='<%#Bind("Path1") %>' runat="server" />
                                           </asp:linkbutton>
                                                            </div>
                                                            <div class="col product-item__body pl-2 pl-lg-3">
                                                                   <asp:Label ID="Label1" style="display:none !important;" Text='<%# Eval("Price") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label2" style="display:none !important;" Text='<%# Eval("Price1") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label3" style="display:none !important;" Text='<%# Eval("Quantity") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label4" style="display:none !important;" Text='<%# Eval("Id") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label5" style="display:none !important;" Text='<%# Eval("Weight") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label6" style="display:none !important;" Text='<%# Eval("Title") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label7" style="display:none !important;" Text='<%# Eval("Path1") %>' runat="server"></asp:Label>                                          

                                                                  <p style="margin-bottom:0rem !important;margin-bottom:0rem !important;font-weight:bold !important;"> 
                                               <asp:linkbutton id="Linkbutton4" style="font-size: 12px !important;font-family:'Open Sans', sans-serif !important;color: #555 !important;line-height:12px !important;" href='<%#"Shop-Details.aspx?pid="+Eval("Id")%>' runat="server">
	                                            <%# Eval("Title").ToString().PadRight(45).Substring(0,45).TrimEnd() %>
	                                             </asp:linkbutton></p>
                                                
                                            <%-- <div class="text-warning mb-2" style="margin-bottom:0.2rem !important;">
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                    </div>--%>

                                               <p style="display:none !important;"><asp:Label ID="Label101" Text='<%# Eval("Weight") %>' runat="server"></asp:Label></p>
                                                   <p style="margin-bottom: 0rem !important;"><span  id="display1" runat="server"><strong style="text-decoration:line-through;color:red !important;font-size:12px !important;margin-right:10px !important;"><asp:Label ID="Label1x" Text='<%# Eval("Price1") %>' runat="server"></asp:Label> ₹</strong></span>
                                                         <span style="font-size:12px !important;font-weight:bold !important;color:black !important;"><asp:Label ID="Label1y" Text='<%# Eval("Price") %>' runat="server"></asp:Label> ₹</span></p>                                                        
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                             </ItemTemplate>
                                         </asp:Repeater>                                              
                                            </ul>                                 
                                </div>
                             </div>


                    </div>
                </div>
           
            </div>
        </main>
</asp:Content>

