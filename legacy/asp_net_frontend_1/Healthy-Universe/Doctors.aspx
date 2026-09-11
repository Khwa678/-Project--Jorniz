<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Doctors.aspx.cs" Inherits="Doctors" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
      <div class="py-2" style="margin-bottom:0px !important;margin-top: 10px !important;">
                <div class="container" style="padding-left:0px !important;">
                    <div class="flex-center-between d-block d-md-flex">
                        <div class="mb-3 mb-md-0">                
                       <p style="margin-bottom:0em !important">
                            <a href="Default.aspx"><i class="fa fa-home"></i></a>
                            <a href="Search.aspx"> / <b>Explore</b></a> /
                           <span style="color:#000 !important">Displaying All Doctor's</span>
                            </p>
                       </div>
                                                    </div>

                                                </div>
                            </div>
      
           <!-- Brand Carousel -->

          <div class="container mb-8" style="margin-bottom: 0.5rem !important;">
             
                    <ul class="row list-unstyled products-group no-gutters" style="margin-top:15px !important;">

                           <asp:Repeater ID="Repeater3" runat="server">
                                                <ItemTemplate>
                               
                               <li class="col-12 col-wd-12 col-md-3" style="margin-bottom: 20px !important;">
                            <asp:linkbutton id="Linkbutton1" runat="server" PostBackUrl='<%#"~/Doctor-Details.aspx?Professionid="+Eval("Id")%>'>
                                <div class="js-slide" style="padding-left:20px !important;padding-right:20px !important;text-align:center !important;">
                                <asp:Image ID="imgPhoto" class="images" lass="img-fluid m-auto" style="width:100% !important;height:auto !important;margin:auto !important;border-radius:3% !important;margin-bottom:15px !important;" runat="server" ImageUrl='<%#Bind("Path1") %>' />
                                <p style="margin-bottom: 10px;text-align: left;"><b> Name : </b><asp:Label ID="Label1" style="color:black !important;font-size:14px !important;line-height:16px !important;" Text='<%# Eval("Name") %>' runat="server"></asp:Label></p>
                                 <p style="margin-bottom: 10px;text-align: left;"> <b> Profession : </b> <asp:Label ID="Label2" style="color:black !important;font-size:14px !important;line-height:16px !important;" Text='<%# Eval("Profession") %>' runat="server"></asp:Label></p>
                                  <p style="margin-bottom: 10px;text-align: left;"> <b> Qualification : </b> <asp:Label ID="Label3" style="color:black !important;font-size:14px !important;line-height:16px !important;" Text='<%# Eval("Qualification") %>' runat="server"></asp:Label></p>
                                      <p style="margin-bottom: 10px;text-align: left;"> <b> Experience : </b>  <asp:Label ID="Label4" style="color:black !important;font-size:14px !important;line-height:16px !important;" Text='<%# Eval("Experience") %>' runat="server"></asp:Label></p>

                                </div>
                                </asp:linkbutton>
                                    <asp:LinkButton ID="LinkButton2" runat="server"  PostBackUrl='<%#"~/Doctor-Details.aspx?Professionid="+Eval("Id")%>' style="border: 1px solid;padding: 5px 90px;margin-left: 17px;">Book Now</asp:LinkButton>
                                               </ItemTemplate>
                           </asp:Repeater>
                        
                    </ul>
                              
            </div>


  
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat&display=swap');

* {
  box-sizing: border-box;
}
body {
 
  background-color:#f4f6f8;
}
.container{
 
  
  align-items:center;
  justify-content:center;

  
  overflow:hidden;

  .images{
    position:relative;
    display:flex;
    
    flex-direction:column;
    justify-content:center;
    width:250px;
    height:250px;
    
    border-radius:50%;
 
    background-size:cover;
    transition: ease-in-out .3s;
    
    z-index:2;
    &:before{
      content: ' ';
      position:absolute;
      
      width:100%;
      height:100%;
      top:0;
      bottom:0;
      left:0;
      margin:auto;
      
      background: inherit;
      background-position:bottom;
      filter:blur(40px) saturate(0%);
      transform:scaleX(0.4);
      transition:ease-in-out .4s;
      border-radius:120px;
      transform-origin:right;
      opacity:0;
      
      z-index:-1;
    }
    .container__info{
      position:relative;
      
      line-height:1.8;
      transition:ease-in-out .3s;
      opacity:0;
    }
    .container__location{
      transition-delay: .15s;
    }
    &:hover{
      border-radius:0;
      width:450px;
      height:310px;
      
      box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.04), 0px 2px 6px rgba(9, 55, 53, 0.08), 0px 16px 24px rgba(9, 55, 53, 0.1), 0px 24px 32px rgba(9, 55, 53, 0.14);
      &:before{
        width:100%;
        
        opacity: 0.18;
        filter:blur(10px) saturate(100%);
        transform:scale(2.8) translate3d(-18%, 0px, 0px);
      }
      
      .container__info{
        transform:translate3d(-60%,0px,0px);
        opacity:1;
      }
    }
  }
}
.link{
  border-bottom: 1px solid transparent;
  color:#06C0A8;
  text-decoration:none;
  transition: ease-in .13s;
  &:hover{
     background-color: #06C0A8;
     color:#ffffff;
   }
}

        </style>
</asp:Content>



