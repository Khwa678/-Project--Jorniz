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

public partial class Shop_Details : System.Web.UI.Page
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
        success.Style.Add("display", "none");
        failed.Style.Add("display", "none");



        if (!this.IsPostBack)
        {
            try
            {
                product_id = Request.QueryString["pid"];
                string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;

                string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                SqlConnection con1 = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);

                    string str1 = " SELECT * FROM Products WHERE Id = @Id";
                    using (SqlConnection connection = new SqlConnection(strConnString1))
                    {
                        //parametrized query to prevent SQL Injection
                        SqlCommand command = new SqlCommand(str1, connection);
                        command.Parameters.Add("@Id", product_id);
                        connection.Open();
                        SqlDataReader reader = command.ExecuteReader();
                        reader.Read();
                        Label3.Text = reader["Title"].ToString();
                        Label5.Text = reader["Title"].ToString();
                        Label6.Text = reader["Id"].ToString();

                        Label4.Text = reader["Description"].ToString();

                        ccode = reader["Ccode"].ToString();

                        quantity = reader["Quantity"].ToString();
                        categoryid = reader["Categoryid"].ToString();

                        Image1.ImageUrl = reader["Path1"].ToString();
                        Image2.ImageUrl = reader["Path3"].ToString();
                        Image3.ImageUrl = reader["Path4"].ToString();


                        price = reader["Price"].ToString();
                        price1 = reader["Price1"].ToString();

                        Label2.Text = reader["Price"].ToString();
                        Label1.Text = reader["Price1"].ToString();

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


                    if (price == price1)
                    {
                        display1.Style.Add("display", "none");
                        display2.Style.Add("display", "none");
                    }
                    else
                    {
                        display1.Style.Add("display", "inline-block");
                        display2.Style.Add("display", "inline-block");
                    }

                    if (Image1.ImageUrl == "https://healthyuniverse.co.in/System-Administrator/testpic.jpg")
                    {
                        img1.Style.Add("display", "none");
                        Image1.Visible = false;

                    }
                    else
                    {
                        img1.Style.Add("display", "block");


                    }

                    if (Image2.ImageUrl == "https://healthyuniverse.co.in/System-Administrator/testpic.jpg")
                    {
                        img2.Style.Add("display", "none");
                        Image2.Visible = false;
                    }
                    else
                    {
                        img2.Style.Add("display", "block");

                    }

                    if (Image3.ImageUrl == "https://healthyuniverse.co.in/System-Administrator/testpic.jpg")
                    {
                        img3.Style.Add("display", "none");
                        Image3.Visible = false;
                    }
                    else
                    {
                        img3.Style.Add("display", "block");

                    }
                
                this.Page.Title = Label3.Text + " | Healthy Universe";

                string cartfnc;
                cartfnc = Request.QueryString["cartfnc"];

                if (cartfnc == "active")
                {
                    if (quantity == "1")
                    {
                        buyselection.Style.Add("display", "inline-block");
                        available.Style.Add("display", "inline-block");
                        notavailable.Style.Add("display", "none");
                        noselection.Style.Add("display", "none");

                    }
                    else
                    {
                        buyselection.Style.Add("display", "none");
                        available.Style.Add("display", "none");
                        notavailable.Style.Add("display", "inline-block");
                        noselection.Style.Add("display", "inline-block");
                    }

                    cartselection.Style.Add("display", "inline-block");
                }
                else
                {

                    if (quantity == "1")
                    {
                        buyselection.Style.Add("display", "inline-block");
                        available.Style.Add("display", "inline-block");
                        notavailable.Style.Add("display", "none");
                        noselection.Style.Add("display", "none");

                    }
                    else
                    {
                        buyselection.Style.Add("display", "none");
                        available.Style.Add("display", "none");
                        notavailable.Style.Add("display", "inline-block");
                        noselection.Style.Add("display", "inline-block");
                    }

                    cartselection.Style.Add("display", "none");

                }

            }
            catch
            {
                Response.Redirect("Search.aspx");
            }

            
            BindData3();

           
        }

    }
    protected void BindData3()
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection conn = new SqlConnection(constring);
        DataSet ds = new DataSet();
        DataTable FromTable = new DataTable();
        conn.Open();
        string cmdstr = "Select TOP (4) * From Products ORDER BY Id DESC";
        SqlCommand cmd = new SqlCommand(cmdstr, conn);
        SqlDataAdapter adp = new SqlDataAdapter(cmd);
        adp.Fill(ds);
        Repeater3.DataSource = ds.Tables[0];
        Repeater3.DataBind();
        conn.Close();
    }
    protected void Repeater3_ItemDataBound(object sender, System.Web.UI.WebControls.RepeaterItemEventArgs e)
    {
        if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
        {

            string strConnString = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            RepeaterItem item = e.Item;

            //Reference the Controls.
            string priceoriginal = (item.FindControl("Label1") as Label).Text;
            string retailprice = (item.FindControl("Label2") as Label).Text;
            string qty = (item.FindControl("Label3") as Label).Text;

            string pid = (item.FindControl("Label4") as Label).Text;
            string pweight = (item.FindControl("Label5") as Label).Text;

            HtmlGenericControl sample1 = e.Item.FindControl("display1") as HtmlGenericControl;
            HtmlGenericControl sample3 = e.Item.FindControl("display3") as HtmlGenericControl;
            HtmlGenericControl sample4 = e.Item.FindControl("display4") as HtmlGenericControl;
            HtmlGenericControl sample2 = e.Item.FindControl("discounttag") as HtmlGenericControl;

            HtmlControl maindiv = e.Item.FindControl("displaymain") as HtmlControl;

            DropDownList ddlCountries = (e.Item.FindControl("DropDownList3") as DropDownList);
            Label novariation = (e.Item.FindControl("Label101") as Label);




            try
            {
                if (priceoriginal == retailprice)
                {
                    sample1.Style.Add("display", "none");
                    sample2.Style.Add("display", "none");
                }
                else
                {
                    sample1.Style.Add("display", "inline-block");
                    sample2.Style.Add("display", "inline-block");

                    double oprice = Convert.ToDouble(priceoriginal);
                    double rprice = Convert.ToDouble(retailprice);
                    double perval = (oprice / rprice) * 100;
                    double newfinal = 100 - perval;


                    int perint = Convert.ToInt32(newfinal);

                    (item.FindControl("Label8") as Label).Text = perint.ToString();
                }

            }
            catch
            {
                sample1.Style.Add("display", "none");
            }


        }
    }
    protected void Button1_Click(object sender, System.EventArgs e)
    {
        try
        {

            double Price = Convert.ToDouble(Label2.Text);
            string ProductName = Label3.Text;
            string Deliverytype = "Standard";

            string ProductImageUrl = Image1.ImageUrl;


            int ProductID = int.Parse(Request.QueryString["pid"]);
            if (Profile.SCart == null)
            {
                Profile.SCart = new ShoppingCartExample.Cart();
            }
            Profile.SCart.Insert(ProductID, Price, 1, ProductName, ProductImageUrl, Deliverytype);
            buyselection.Style.Add("display", "none");


            Response.Redirect("Shop-Details.aspx?pid="+ Request.QueryString["pid"] +"&cartfnc=active");


        }
        catch
        {
            failed.Style.Add("display", "block");
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


            int ProductID = int.Parse(Request.QueryString["pid"]);

            Profile.SCart.Items.Clear();
            Profile.SCart.Insert(ProductID, Price, 1, ProductName, ProductImageUrl, Deliverytype);

             Response.Redirect("Cart.aspx");
        }
        catch
        {
            failed.Style.Add("display", "block");
        }
    }
   

    protected void Repeater1_ItemDataBound(object sender, RepeaterItemEventArgs e)
    {
        if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
        {

            string strConnString = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            RepeaterItem item = e.Item;

            //Reference the Controls.
            string ccode = (item.FindControl("Label11") as Label).Text;
             (item.FindControl("Label101") as Label).BackColor = System.Drawing.ColorTranslator.FromHtml(ccode);


        }
    }
}