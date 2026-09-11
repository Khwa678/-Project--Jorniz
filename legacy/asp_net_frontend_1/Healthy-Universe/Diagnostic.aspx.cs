using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

using System.Web.Script.Serialization;
using System.Data;
using System.Configuration;
using System.Data.SqlClient;
using System.Web.Security;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.IO;
using System;
using System.Data;
using System.Configuration;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.IO;
using System.Collections.Generic;
using System.Net;
using System.Collections.Specialized;
using System.Net.Mail;
using System.IO;
using System.Net;
using System.Text;
using System;
using System.Data;
using System.Configuration;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Security.Cryptography;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text;
using System.Net;

public partial class Diagnostic : System.Web.UI.Page
{
    string Pid = string.Empty;
    string quantity;
    string price, price1;
    string categoryid;
    string videopath;
    string product_id;
    string discountper = string.Empty;
    string ccode = string.Empty;

    string descriptiontag;
    string keywordstag;
    protected void Page_Load(object sender, EventArgs e)
    {
        success.Style.Add("Display", "None");
        error3.Style.Add("Display", "None");
        if (!this.IsPostBack)
        {
            try
            {
                Pid = Request.QueryString["pid"];
                string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;

                string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                SqlConnection con1 = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);

                string str1 = " SELECT * FROM Tests WHERE id = @id";
                using (SqlConnection connection = new SqlConnection(strConnString1))
                {
                    //parametrized query to prevent SQL Injection
                    SqlCommand command = new SqlCommand(str1, connection);
                    command.Parameters.Add("@id", Pid);
                    connection.Open();
                    SqlDataReader reader = command.ExecuteReader();
                    reader.Read();
                    Label1.Text = reader["Title"].ToString();
                    Label2.Text = reader["Title"].ToString();
                    Label3.Text = reader["Weight"].ToString();
                    Label4.Text = reader["Price1"].ToString();
                    Label5.Text = reader["Price"].ToString();
                    Label6.Text = reader["Title"].ToString();
                    Label7.Text = reader["Description"].ToString();
                    Label8.Text = reader["Dtag"].ToString();
                    Label9.Text = reader["Ktag"].ToString();

                    //Label4.Text = reader["Description"].ToString();

                    //ccode = reader["Ccode"].ToString();

                    //quantity = reader["Quantity"].ToString();
                    //categoryid = reader["Categoryid"].ToString();

                    Image1.ImageUrl = reader["Path1"].ToString();
                    //Image2.ImageUrl = reader["Path3"].ToString();
                    //Image3.ImageUrl = reader["Path4"].ToString();


                    //price = reader["Price"].ToString();
                    //price1 = reader["Price1"].ToString();

                    //Label2.Text = reader["Price"].ToString();
                    //Label1.Text = reader["Price1"].ToString();

                    descriptiontag = reader["Dtag"].ToString();
                    keywordstag = reader["Ktag"].ToString();



                    //Label21.Text = reader["Pattern"].ToString();
                    //Label22.Text = reader["Fabric"].ToString();
                    //Label23.Text = reader["Fittype"].ToString();
                    //Label24.Text = reader["IncludedItem"].ToString();
                    //Label25.Text = reader["A1"].ToString();
                    //Label26.Text = reader["A2"].ToString();
                    //Label27.Text = reader["A3"].ToString();
                    //Label28.Text = reader["A4"].ToString();
                    //Label29.Text = reader["A5"].ToString();
                    //Label30.Text = reader["A6"].ToString();
                    //Label31.Text = reader["A7"].ToString();




                    reader.Close();
                    connection.Close();
                }

                //Add Keywords Meta Tag
                HtmlMeta keywords = new HtmlMeta();
                keywords.HttpEquiv = "keywords";
                keywords.Name = "keywords";
                keywords.Content = keywordstag;
                this.Page.Header.Controls.Add(keywords);

                //Add Description Meta Tag
                HtmlMeta description = new HtmlMeta();
                description.HttpEquiv = "description";
                description.Name = "description";
                description.Content = descriptiontag;
                this.Page.Header.Controls.Add(description);




                this.Page.Title = Label1.Text + " | Healthy Universe | Diagnostic Test";



            }
            catch
            {
                Response.Redirect("Selected-Tests.aspx");
            }
        }
       
    }

    protected void Button1_Click(object sender, EventArgs e)
    {
        try
        {

            double Price = Convert.ToDouble(Label4.Text);
            string ProductName = Label1.Text;
            string Deliverytype = "Standard";

            string ProductImageUrl = Image1.ImageUrl;


            int ProductID = int.Parse(Request.QueryString["pid"]);
            if (Profile.SCart == null)
            {
                Profile.SCart = new ShoppingCartExample.Cart();
            }
            Profile.SCart.Insert(ProductID, Price, 1, ProductName, ProductImageUrl, Deliverytype);

            success.Style.Add("Display", "block");

            Response.Redirect("Diagnostic.aspx?pid=" + Request.QueryString["pid"] + "&cartfnc=active");
            //buyselection.Style.Add("display", "none");
           
        }
        catch
        {
            error3.Style.Add("display", "block");
        }
    }
}