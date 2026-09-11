<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Diagnostic.aspx.cs" Inherits="Diagnostic" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">


       <div class="py-2" style="margin-bottom:0px !important;margin-top: 10px !important;">
                <div class="container" style="padding-left:0px !important;">
                    <div class="flex-center-between d-block d-md-flex">
                        <div class="mb-3 mb-md-0">                
                       <p style="margin-bottom:0em !important">
                            <a href="Default.aspx" style="font-size: 11px;margin-left: 5px;color: #555;"><i class="fa fa-home"></i>Home</a>
                            <a href="Selected-Tests.aspx"style="font-size: 11px;margin-left: 5px;color: #555;">/ Explore</a> /
                           <span style="font-size: 11px;margin-left: 5px;color: #555;">
                               <asp:Label ID="Label1" runat="server"></asp:Label></span>
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
      <div class="container">
        <div class="row">
            <img src="Img/download.png" style="width:100% !important;height:auto !important;margin:auto !important"/>

            </div>

        </div>
    <div class="container mb-8" style="margin-bottom: 0.5rem !important;">
            
            <p id="success" runat="server" style="padding:5px !important;background-color:green !important;color:white !important;padding-left:15px !important;"><i class="fa fa-success"></i> &nbsp; <b>Add to cart successfull!</b></p>
           <p id="error3" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;"><i class="fa fa-warning"></i> &nbsp; <b>Sorry!</b> Some Error Occoured. Please Try again later.</p>


                    <ul class="row list-unstyled products-group no-gutters" style="margin-top:15px !important;">

                               <li class="col-12 col-wd-8 col-md-8" style="margin-bottom: 20px !important;border: 0.5px solid hsla(0,0%,46%,.4);">
                           <asp:linkbutton id="Linkbutton1" runat="server" PostBackUrl='<%#"~/Selected-Tests.aspx?id="+Eval("Id")%>'>
                                <div class="js-slide" style="padding:20px !important;text-align:left !important;">
                               
                                 <p style="margin-bottom: 10px;text-align: left;"><b> </b><asp:Label ID="Label2" style="color:black !important;font-size:25px !important;line-height:16px !important;" runat="server"></asp:Label></p>
                                     <p style="margin: 0px;font-size: 15px;font-weight: 600;">Included<asp:Label ID="Label3" Text='<%# Eval("Weight") %>' runat="server" style="margin: 0px 5px !important"></asp:Label>Tests</p>
                                                     <p style="margin: 0px;font-size: 12px;font-weight: 600;">Get Report Within 24 hours</p>
                                    <p style="margin-bottom: 0rem !important;"><span  id="display1" runat="server"><strong style="text-decoration:line-through;color:red !important;font-size:18px !important;margin-right:10px !important;"><asp:Label ID="Label4" runat="server"></asp:Label>₹</strong></span>
                                                         <span style="font-size:20px !important;font-weight:bold !important;color:black !important;"><asp:Label ID="Label5" runat="server"></asp:Label>₹</span></p>
                                                     <asp:Button ID="Button1" OnClick="Button1_Click" style="font-size: 14px;font-weight: 700;color: #ff6f61;cursor: pointer;background-color:none !important;border:none !important;float:right !important;margin-bottom:10px !important" runat="server" Text="Add to Cart" />  
                      
                                </div>
                            </asp:linkbutton>
                                   <%-- <asp:LinkButton ID="LinkButton2" runat="server"  PostBackUrl='<%#"~/Doctor-Details.aspx?Professionid="+Eval("Id")%>' style="border: 1px solid;padding: 5px 90px;margin-left: 17px;">Book Now</asp:LinkButton>--%>
                            </li>  
                         <li class="col-12 col-wd-1 col-md-1">             
                            </li>  
                          <li class="col-12 col-wd-2 col-md-2" style="margin-bottom: 20px !important;border: 0.5px solid hsla(0,0%,46%,.4);">
                  <asp:Image ID="Image1" lass="img-fluid m-auto" style="width:100% !important;height:auto !important;margin:auto !important;border-radius:3% !important;margin-bottom:15px !important;" runat="server" ImageUrl='<%#Bind("Path1") %>' />
                            </li>    
                    </ul>
                   <p style="margin-bottom: 10px;text-align: left;font-weight:800 !important">Overview of <asp:Label ID="Label6" style="margin-bottom: 10px;text-align: left;font-weight:800 !important" runat="server"></asp:Label></p>
                             <p style="margin-bottom: 10px;text-align: left;"><asp:Label ID="Label7" style="font-size:14px !important;line-height:16px !important;"  runat="server"></asp:Label></p>
                                  <p style="margin-bottom: 10px;text-align: left;"> <b>Sample Required : </b><br/> <asp:Label ID="Label8" style="margin-bottom: 10px;text-align: left;font-weight:800 !important"  runat="server"></asp:Label></p>
                                     <p style="margin-bottom: 10px;text-align: left;"> <b> Preparations : </b> <br/> <asp:Label ID="Label9" style="margin-bottom: 10px;text-align: left;font-weight:800 !important"  runat="server"></asp:Label></p>
            
            </div>
          

  
 
</asp:Content>

