<%@ Page Title="Healthy Universe | Health & Fitness Products | Diagnostic Services" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

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
                        <h3 class="section-title section-title__full mb-0 pb-2 font-size-17" style="font-weight:bold !important;margin-bottom:15px !important;">Explore Department</h3>
                    </div>
            </div>   
           <!-- Brand Carousel -->
            <div class="container mb-8" style="margin-bottom: 0.5rem !important;">           
                    <ul class="row list-unstyled products-group no-gutters" style="margin-top:15px !important;">
                           <asp:Repeater ID="Repeater91" runat="server">
                               <ItemTemplate>                              
                               <li class="col-4 col-wd-3 col-md-2" style="text-align:left !important;">
                                <asp:linkbutton id="Linkbutton1" runat="server" PostBackUrl='<%#"~/Category.aspx?categoryid="+Eval("Id")%>'>
                                <div class="js-slide" style="padding-left:5px !important;padding-right:5px !important;text-align:center !important;">
                                <asp:Image ID="imgPhoto" lass="img-fluid m-auto" style="width:100% !important;height:auto !important;margin:auto !important;margin-bottom:0px !important;border-radius:8px !important;" runat="server" ImageUrl='<%#Bind("Path1") %>' />
                                <p style="line-height:1.1 !important;margin-top:10px !important;margin-bottom: 1rem;text-align:left !important;"><asp:Label ID="Label1" style="font-weight:bold !important;color:black !important;font-size:13px !important;line-height:16px !important;" Text='<%# Eval("Title") %>' runat="server"></asp:Label></p>
                                </div>
                                </asp:linkbutton>
                                 </li>
                               </ItemTemplate>
                           </asp:Repeater>
                             <li class="col-4 col-wd-3 col-md-2" style="text-align:left !important;">
                                 <a href="https://healthyuniverse.co.in/Selected-Tests.aspx">
                             
                                <div class="js-slide" style="padding-left:5px !important;padding-right:5px !important;text-align:center !important;">                            
                                    <img src="images/DS.png" style="width:100% !important;height:auto !important;margin:auto !important;margin-bottom:0px !important;border-radius:8px !important;"/>
                                <p style="line-height:1.1 !important;margin-top:10px !important;margin-bottom: 1rem;text-align:left !important; font-weight:bold !important;color:black !important;font-size:13px !important;line-height:16px !important;" ">Diagnostic Services</p>
                                </div>    
                                   </a>
                                        
                                 </li>
                          <li class="col-4 col-wd-3 col-md-2" style="text-align:left !important;">
                              <a href="https://healthyuniverse.co.in/Services-Details.aspx?Serviceid=2">
                             
                                <div class="js-slide" style="padding-left:5px !important;padding-right:5px !important;text-align:center !important;">                             
                                    <img src="images/HI.png" style="width:100% !important;height:auto !important;margin:auto !important;margin-bottom:0px !important;border-radius:8px !important;"/>
                                <p style="line-height:1.1 !important;margin-top:10px !important;margin-bottom: 1rem;text-align:left !important; font-weight:bold !important;color:black !important;font-size:13px !important;line-height:16px !important;" ">Health Insurance </p>
                                </div>
                                     </a>
                                 </li>
                          <li class="col-4 col-wd-3 col-md-2" style="text-align:left !important;">     
                               <a href="Doctor-Details.aspx">
                                <div class="js-slide" style="padding-left:5px !important;padding-right:5px !important;text-align:center !important;">                             
                                    <img src="images/Dc.png" style="width:100% !important;height:auto !important;margin:auto !important;margin-bottom:0px !important;border-radius:8px !important;"/>
                                <p style="line-height:1.1 !important;margin-top:10px !important;margin-bottom: 1rem;text-align:left !important; font-weight:bold !important;color:black !important;font-size:13px !important;line-height:16px !important;" ">Online Doctor Consultation</p>
                                </div>     
                                   </a>
                                 </li>
                         </ul>             
            </div>                         
            <div class="container">
                 <div class="d-flex justify-content-between border-bottom border-color-1 flex-md-nowrap flex-wrap border-sm-bottom-0" style="border:none !important;">
                        <h3 class="section-title section-title__full mb-0 pb-2 font-size-17" style="font-weight:bold !important;margin-bottom:15px !important;">Explore Categories</h3>
                   <a href="Category.aspx">  <p style="float:right !important;font-size:12px !important;margin-top: 0.5rem !important;margin-bottom: 0.2rem !important;font-weight:bold !important;">Swipe For More <i class="fa fa-arrow-alt-circle-right"></i></p></a>
                    </div>                             
            </div>

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
                               <asp:linkbutton id="Linkbutton1" runat="server" PostBackUrl='<%#"~/Subcategory.aspx?subcategoryid="+Eval("Id")%>'>
                                <div class="js-slide" style="padding-left:20px !important;padding-right:20px !important;text-align:center !important;">
                                <asp:Image ID="imgPhoto" lass="img-fluid m-auto" style="width:100% !important;height:auto !important;margin:auto !important;margin-bottom:15px !important;" runat="server" ImageUrl='<%#Bind("Path1") %>' />
                                   <asp:Label ID="Label1" style="font-weight:bold !important;color:black !important;font-size:14px !important;line-height:16px !important;" Text='<%# Eval("Title") %>' runat="server"></asp:Label>
                                </div>
                                </asp:linkbutton>
                                               </ItemTemplate>
                           </asp:Repeater>

                    </div>
              
            </div>      
            <!-- End Brand Carousel -->


      <div class="container">             
                <div class="mb-5" style="margin-bottom:1rem !important;">
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
                                                    Latest Arrivals
                                                </div>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <!-- End Nav Classic -->

                                <!-- Tab Content -->
                                <div class="tab-content" id="pills-tabContent">
                                    <div class="tab-pane fade pt-2 show active" id="pills-one-example1" role="tabpanel" aria-labelledby="pills-one-example1-tab">
                                        <ul class="row list-unstyled products-group no-gutters">


                                            <asp:Repeater ID="Repeater3" runat="server" OnItemDataBound="Repeater3_ItemDataBound">
                                                <ItemTemplate>

                                            <li class="col-6 col-wd-2 col-md-2">
                                             
	                                    <div style="padding:5px !important;margin:5px !important;border:solid #f2f2f2 2px !important;min-height:340px !important;">
	                                      
                                            <asp:Label ID="Label1" style="display:none !important;" Text='<%# Eval("Price") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label2" style="display:none !important;" Text='<%# Eval("Price1") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label3" style="display:none !important;" Text='<%# Eval("Quantity") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label4" style="display:none !important;" Text='<%# Eval("Id") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label5" style="display:none !important;" Text='<%# Eval("Weight") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label6" style="display:none !important;" Text='<%# Eval("Title") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label7" style="display:none !important;" Text='<%# Eval("Path1") %>' runat="server"></asp:Label>
                                          
                                           
	                                            <figure style="margin-bottom:12px !important;">
                                                    <span id="discounttag" style="font-weight:bold !important;font-size:13px !important;margin-top:10px !important;position:absolute !important;margin-left:10px !important;padding:3px 5px !important;background-color:#ff0000;color:#fff !important;font-family:'Open Sans', sans-serif !important;" runat="server"><asp:Label ID="Label8" runat="server"></asp:Label>% OFF</span>
                                           <asp:linkbutton id="Linkbutton3" href='<%#"Shop-Details.aspx?pid="+Eval("Id")%>' runat="server">
	                                            <asp:Image ID="imgPhoto" style="width:100% !important;height:auto !important;margin:auto !important;" class="lazy" ImageUrl='<%#Bind("Path1") %>' runat="server" />
                                           </asp:linkbutton>
                                                </figure>

                                           <p style="margin-bottom:0rem !important;max-height:40px !important;margin-bottom:0.5rem !important;"> 
                                               <asp:linkbutton id="Linkbutton4" style="font-size: 13px !important;font-family:'Open Sans', sans-serif !important;color: #555 !important;line-height:12px !important;font-weight: 700;" href='<%#"Shop-Details.aspx?pid="+Eval("Id")%>' runat="server">
	                                            <%# Eval("Title").ToString().PadRight(45).Substring(0,45).TrimEnd() %>
	                                             </asp:linkbutton></p>
                                                
                                             <div class="text-warning mb-2">
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                    </div>
                                                  
                                                   <p style="display:none !important;"><asp:Label ID="Label101" Text='<%# Eval("Weight") %>' runat="server"></asp:Label></p>
                                                   <p style="margin-bottom: 0rem !important;"><span  id="display1" runat="server"><strong style="text-decoration:line-through;color:red !important;font-size:12px !important;margin-right:10px !important;"><asp:Label ID="Label1x" Text='<%# Eval("Price1") %>' runat="server"></asp:Label>₹</strong></span>
                                                         <span style="font-size:15px !important;font-weight:bold !important;color:black !important;"><asp:Label ID="Label1y" Text='<%# Eval("Price") %>' runat="server"></asp:Label>₹</span></p>
                                                            	                                      
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
                <div class="container" style="margin-bottom:20px;">
              <a href="Doctors.aspx"><img src="images/Obanners.png" style="height:auto; width:100%; margin-top:30px;" /></a>
        </div>         
    
                         <div class="container" style="margin-bottom:20px;">                 
                                <div class="position-relative bg-white text-left z-index-2" style="margin-bottom:2rem;">
                                    <ul class="nav nav-classic nav-tab justify-content-left" id="pills-tab11" role="tablist">
                                        <li class="nav-item">
                                            <a class="nav-link active " id="pills-one-example1-tab111" data-toggle="pill" href="#pills-one-example1" role="tab" aria-controls="pills-one-example1" aria-selected="true">
                                                <div class="d-md-flex justify-content-md-left align-items-md-left">
                                                   Our Services
                                                </div>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                             </div>
           <!-- Brand Carousel -->
            <div class="container mb-8" style="margin-bottom: 2.5rem !important;">
             
                    <ul class="row list-unstyled products-group no-gutters" style="margin-top:15px !important;">

                           <asp:Repeater ID="Repeater8" runat="server">
                                                <ItemTemplate>
                               
                               <li class="col-4 col-wd-3 col-md-2" style="text-align:left !important;">
                                <asp:linkbutton id="Linkbutton1" runat="server" PostBackUrl='<%# Eval("Ridirect") %>'>
                                <div class="js-slide" style="padding-left:5px !important;padding-right:5px !important;text-align:center !important;">
                                <asp:Image ID="imgPhoto" lass="img-fluid m-auto" style="width:100% !important;height:auto !important;margin:auto !important;margin-bottom:0px !important;border-radius:8px !important;" runat="server" ImageUrl='<%#Bind("Path1") %>' />
                                <p style="line-height:1.1 !important;margin-top:10px !important;margin-bottom: 1rem;text-align:left !important;"><asp:Label ID="Label1" style="font-weight:bold !important;color:black !important;font-size:13px !important;line-height:16px !important;" Text='<%# Eval("Title") %>' runat="server"></asp:Label></p>
                                </div>
                                </asp:linkbutton>

                                   </li>
                                               </ItemTemplate>
                           </asp:Repeater>

                    </ul>
              
            </div>
    
            <!-- End Brand Carousel -->
   <%-- Free Consultation Form Start--%>
    <hr/>
     

        
            <div class="container mb-8 mb-lg-0" style=" margin-bottom: 1.5rem !important;">
                <div class="row mb-8" style=" margin-bottom: 1.5rem !important;">
                    <div class="col-lg-4">
                        <div class="row">
                            <img src="images/SBanners.png" style="width:100% !important;margin:auto !important;height:auto !important" />
                        </div>
                    </div>
                    <div class="col-lg-8">
                        <div class="ml-lg-8">
                            <h3 class="font-size-18 font-weight-semi-bold text-gray-39 mb-4">What can we do for you ?</h3>
                            <!-- Basics Accordion -->
                            <div id="basicsAccordion1" class="about-accordion">
                                <!-- Card -->
                                <div class="card mb-4 border-color-4 rounded-0">
                                    <div class="card-header card-collapse border-color-4" id="basicsHeadingOne">
                                        <h5 class="mb-0">
                                            <button type="button" class="btn btn-link btn-block flex-horizontal-center card-btn p-0 font-size-18"
                                                data-toggle="collapse"
                                                data-target="#basicsCollapseOnee"
                                                aria-expanded="true"
                                                aria-controls="basicsCollapseOnee">
                                                <span class="border border-color-5 rounded font-size-12 mr-5">
                                                    <i class="fas fa-plus"></i>
                                                    <i class="fas fa-minus"></i>
                                                </span>
                                                Support 24/7
                                            </button>
                                        </h5>
                                    </div>
                                    <div id="basicsCollapseOnee" class="collapse show"
                                        aria-labelledby="basicsHeadingOne"
                                        data-parent="#basicsAccordion1">
                                        <div class="card-body">
                                            <p class="mb-0">Welcome to the 24/7 support service of Healthy Universe! We are here to assist you with any 
                                                inquiries or issues you may have. Our dedicated team is available round the clock to provide you
                                                with the best possible support. Whether you have questions about our products, need help with
                                                an order, or require any assistance related to our sportswear, we've got you covered!</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- End Card -->

                                <!-- Card -->
                                <div class="card mb-4 border-color-4 rounded-0">
                                    <div class="card-header card-collapse border-color-4" id="basicsHeadingTwo">
                                        <h5 class="mb-0">
                                            <button type="button" class="btn btn-link btn-block flex-horizontal-center card-btn p-0 font-size-18"
                                                data-toggle="collapse"
                                                data-target="#basicsCollapseTwo"
                                                aria-expanded="false"
                                                aria-controls="basicsCollapseTwo">
                                                <span class="border border-color-5 rounded font-size-12 mr-5">
                                                    <i class="fas fa-plus"></i>
                                                    <i class="fas fa-minus"></i>
                                                </span>
                                            Online Doctor's Consult
                                            </button>
                                        </h5>
                                    </div>
                                    <div id="basicsCollapseTwo" class="collapse"
                                        aria-labelledby="basicsHeadingTwo"
                                        data-parent="#basicsAccordion1">
                                        <div class="card-body">
                                            <p class="mb-0">  <b>Convenience and flexibility:</b> You can consult with a doctor from the comfort of your own home, at any time that is convenient for you. This can be especially helpful if you have a busy schedule or if you live in a remote area.<br/>
 <b>Cost-effectiveness:  </b>Online consultations can be a more affordable option than traditional doctor's visits, especially if you have to travel long distances to see a doctor.<br/>
 <b>Privacy:  </b>Online consultations can offer a more private setting than traditional doctor's visits, which can be helpful if you are discussing sensitive health issues.<br/>
 <b>Speed: </b> You can often get an online consultation much faster than you can get an appointment with a doctor in person. This can be helpful if you are feeling sick or if you need to get a prescription refilled.<br/>
 <b>Access to specialists:  </b>You may be able to access specialists through online consultations, even if you live in an area where there are no specialists available.   </p>
                                        </div>
                                    </div>
                                </div>
                                <!-- End Card -->

                                <!-- Card -->
                                <div class="card mb-4 border-color-4 rounded-0">
                                    <div class="card-header card-collapse border-color-4" id="basicsHeadingThree">
                                        <h5 class="mb-0">
                                            <button type="button" class="btn btn-link btn-block flex-horizontal-center card-btn p-0 font-size-18"
                                                data-toggle="collapse"
                                                data-target="#basicsCollapseThree"
                                                aria-expanded="false"
                                                aria-controls="basicsCollapseThree">
                                                <span class="border border-color-5 rounded font-size-12 mr-5">
                                                    <i class="fas fa-plus"></i>
                                                    <i class="fas fa-minus"></i>
                                                </span>
                                                Fastest Delivery Medicine & Other Products
                                            </button>
                                        </h5>
                                    </div>
                                    <div id="basicsCollapseThree" class="collapse"
                                        aria-labelledby="basicsHeadingThree"
                                        data-parent="#basicsAccordion1">
                                        <div class="card-body">
                                            <p class="mb-0">We are thrilled to share an extraordinary accomplishment that has set a new standard
                                                for delivery speed in the industry. At Healthy Universe, we have always 
                                                prioritized efficiency and customer satisfaction, and we are excited to showcase our recent 
                                                record-breaking delivery.</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- End Card -->

                                <!-- Card -->
                                <div class="card mb-4 border-color-4 rounded-0">
                                    <div class="card-header card-collapse border-color-4" id="basicsHeadingFour">
                                        <h5 class="mb-0">
                                            <button type="button" class="btn btn-link btn-block flex-horizontal-center card-btn p-0 font-size-18"
                                                data-toggle="collapse"
                                                data-target="#basicsCollapseFour"
                                                aria-expanded="false"
                                                aria-controls="basicsCollapseFour">
                                                <span class="border border-color-5 rounded font-size-12 mr-5">
                                                    <i class="fas fa-plus"></i>
                                                    <i class="fas fa-minus"></i>
                                                </span>
                                                Customer Care
                                            </button>
                                        </h5>
                                    </div>
                                    <div id="basicsCollapseFour" class="collapse"
                                        aria-labelledby="basicsHeadingFour"
                                        data-parent="#basicsAccordion1">
                                        <div class="card-body">
                                            <p class="mb-0">Whether you need assistance, product information, or placing a request, we 
                                                are dedicated to ensuring your satisfaction. Our knowledgeable and friendly customer care team is
                                                ready to help you make the most informed decisions and provide solutions tailored to your needs.
                                                Please feel free to ask any specific questions you have, and we will be more than happy to assist
                                                you promptly. Your satisfaction is our top priority, and we look forward to serving you.</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- End Card -->

                                <!-- Card -->
                                <%--<div class="card mb-4 border-color-4 rounded-0">
                                    <div class="card-header card-collapse border-color-4" id="basicsHeadingFive">
                                        <h5 class="mb-0">
                                            <button type="button" class="btn btn-link btn-block flex-horizontal-center card-btn p-0 font-size-18"
                                                data-toggle="collapse"
                                                data-target="#basicsCollapseFive"
                                                aria-expanded="false"
                                                aria-controls="basicsCollapseFive">
                                                <span class="border border-color-5 rounded font-size-12 mr-5">
                                                    <i class="fas fa-plus"></i>
                                                    <i class="fas fa-minus"></i>
                                                </span>
                                                Over 200 Satisfied Customers
                                            </button>
                                        </h5>
                                    </div>
                                    <div id="basicsCollapseFive" class="collapse"
                                        aria-labelledby="basicsHeadingFive"
                                        data-parent="#basicsAccordion1">
                                        <div class="card-body">
                                            <p class="mb-0"></p>
                                        </div>
                                    </div>
                                </div>--%>
                                <!-- End Card -->
                            </div>
                            <!-- End Basics Accordion -->
                        </div>
                    </div>
                </div>
            </div>


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
  

       <div class="container">
              
                <div class="mb-5" style="margin-bottom:1rem !important;">
                    <div class="row">
                        <!-- Deal -->
                        
                        <!-- End Deal -->
                        <!-- Tab Prodcut -->
                        <div class="col">
                            <!-- Features Section -->
                            <div class="">

                                  <!-- Nav Classic -->
                                <div class="position-relative bg-white text-left z-index-2">
                                    <ul class="nav nav-classic nav-tab justify-content-left" id="pills-tab1" role="tablist">
                                      
                                        <li class="nav-item">
                                            <a class="nav-link active" id="pills-three-example1-tab" data-toggle="pill" href="#pills-three-example1" role="tab" aria-controls="pills-three-example1" aria-selected="false">
                                                <div class="d-md-flex justify-content-md-left align-items-md-left">
                                                    Our Bestsellers
                                                </div>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <!-- End Nav Classic -->

                                <!-- Tab Content -->
                                <div class="tab-content" id="pills-tabContent1">
                                    
                                    <div class="tab-pane fade pt-2 show active" id="pills-three-example1" role="tabpanel" aria-labelledby="pills-three-example1-tab">
                                        <ul class="row list-unstyled products-group no-gutters">
                                            <asp:Repeater ID="Repeater7" runat="server" OnItemDataBound="Repeater7_ItemDataBound">
                                                <ItemTemplate>

                                            <li class="col-6 col-wd-2 col-md-2">
                                             
	                                    <div style="padding:5px !important;margin:5px !important;border:solid #f2f2f2 2px !important;min-height:340px !important;">
	                                      
                                            <asp:Label ID="Label1" style="display:none !important;" Text='<%# Eval("Price") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label2" style="display:none !important;" Text='<%# Eval("Price1") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label3" style="display:none !important;" Text='<%# Eval("Quantity") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label4" style="display:none !important;" Text='<%# Eval("Id") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label5" style="display:none !important;" Text='<%# Eval("Weight") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label6" style="display:none !important;" Text='<%# Eval("Title") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label7" style="display:none !important;" Text='<%# Eval("Path1") %>' runat="server"></asp:Label>
                                          
                                           
	                                            <figure style="margin-bottom:12px !important;">
                                                    <span id="discounttag" style="font-weight:bold !important;font-size:13px !important;margin-top:10px !important;position:absolute !important;margin-left:10px !important;padding:3px 5px !important;background-color:#ff0000;color:#fff !important;font-family:'Open Sans', sans-serif !important;" runat="server"><asp:Label ID="Label8" runat="server"></asp:Label>% OFF</span>
                                           <asp:linkbutton id="Linkbutton3" href='<%#"Shop-Details.aspx?pid="+Eval("Id")%>' runat="server">
	                                            <asp:Image ID="imgPhoto" style="width:100% !important;height:auto !important;margin:auto !important;" class="lazy" ImageUrl='<%#Bind("Path1") %>' runat="server" />
                                           </asp:linkbutton>
                                                </figure>

                                           
                                                <p style="margin-bottom:0rem !important;max-height:40px !important;margin-bottom:0.5rem !important;"> 
                                               <asp:linkbutton id="Linkbutton4" style="font-size: 13px !important;font-family:'Open Sans', sans-serif !important;color: #555 !important;line-height:12px !important;font-weight: 700;" href='<%#"Shop-Details.aspx?pid="+Eval("Id")%>' runat="server">
	                                            <%# Eval("Title").ToString().PadRight(45).Substring(0,45).TrimEnd() %>
	                                             </asp:linkbutton></p>

                                             <div class="text-warning mb-2">
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                    </div>
                                                  
                                                   <p style="display:none !important;"><asp:Label ID="Label101" Text='<%# Eval("Weight") %>' runat="server"></asp:Label></p>
                                                   <p style="margin-bottom: 0rem !important;"><span  id="display1" runat="server"><strong style="text-decoration:line-through;color:red !important;font-size:12px !important;margin-right:10px !important;"><asp:Label ID="Label1x" Text='<%# Eval("Price1") %>' runat="server"></asp:Label>₹</strong></span>
                                                         <span style="font-size:15px !important;font-weight:bold !important;color:black !important;"><asp:Label ID="Label1y" Text='<%# Eval("Price") %>' runat="server"></asp:Label>₹</span></p>
                                                                                                                                                               
	                                      
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

