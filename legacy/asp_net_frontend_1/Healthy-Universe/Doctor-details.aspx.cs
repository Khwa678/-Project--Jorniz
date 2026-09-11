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

public partial class Doctor_details : System.Web.UI.Page
{
    string aid = string.Empty;
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
     
        failed.Style.Add("display", "none");



        if (!this.IsPostBack)
        {
            try
            {
                product_id = Request.QueryString["professionid"];
                string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;

                string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                SqlConnection con1 = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);

                string str1 = " SELECT * FROM Doctors WHERE Id = @Id";
                using (SqlConnection connection = new SqlConnection(strConnString1))
                {
                    //parametrized query to prevent SQL Injection
                    SqlCommand command = new SqlCommand(str1, connection);
                    command.Parameters.Add("@Id", product_id);
                    connection.Open();
                    SqlDataReader reader = command.ExecuteReader();
                    reader.Read();
                    Label3.Text = reader["Name"].ToString();
                    Label5.Text = reader["Name"].ToString();
                    Label6.Text = reader["Id"].ToString();
                    Label51.Text = reader["Description"].ToString();
                    Image1.ImageUrl = reader["Path1"].ToString();                 
                    Label2.Text = reader["Consultationfee"].ToString();

                    Label52.Text = reader["Email"].ToString();
                    Label53.Text = reader["Qualification"].ToString();
                    Label54.Text = reader["Profession"].ToString();
                    Label55.Text = reader["Experience"].ToString();
                    Label56.Text = reader["Clinicaddress"].ToString();

               


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

                if (Image1.ImageUrl == "https://healthyuniverse.co.in/System-Administrator/testpic.jpg")
                {
                    img1.Style.Add("display", "none");
                    Image1.Visible = false;
                }
                else
                {
                    img1.Style.Add("display", "block");

                }
            
                this.Page.Title = Label3.Text + " | Online Book Doctor | healthy Universe";            

            }
            catch
            {
                Response.Redirect("Doctors.aspx");
            }
        }

    }
   
    protected void Button2_Click(object sender, System.EventArgs e)
    {
        try
        {

            double Price = Convert.ToDouble(Label2.Text);
            string ProductName = Label3.Text;
            string Deliverytype = "Standard";

            string ProductImageUrl = Image1.ImageUrl;


            int ProductID = int.Parse(Request.QueryString["professionid"]);

            Profile.SCart.Items.Clear();
            Profile.SCart.Insert(ProductID, Price, 1, ProductName, ProductImageUrl, Deliverytype);

            Response.Redirect("Cart.aspx");
        }
        catch
        {
            failed.Style.Add("display", "block");
        }
    }
}