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
using System.Net.Mail;

public partial class Search : System.Web.UI.Page
{
    string subcategory, category;
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            BindData5();
        }

    }

    protected void BindData5()
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection conn = new SqlConnection(constring);
        DataSet ds = new DataSet();
        DataTable FromTable = new DataTable();
        conn.Open();
        string cmdstr = "Select  * From Products";
        if (Request.QueryString["term"] != null)
        {
            searchterm.Style.Add("display", "inline-block");
            displaying.Style.Add("display", "none");
            cmdstr += " WHERE Title like '" + '%' + Request.QueryString["term"] + '%' + "'";
            Label11.Text = Request.QueryString["term"];
        }
        else
        {
            searchterm.Style.Add("display", "none");
            displaying.Style.Add("display", "inline-block");
        }

        if (Request.QueryString["Lastcategoryid"] != null)
        {
            subcategoryname.Style.Add("display", "inline-block");
            cmdstr += " WHERE Lastcategoryid='" + Request.QueryString["Lastcategoryid"] + "'";

            //string core;
            string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            string str1 = " SELECT * FROM Lastcategory Where id = @id";
            using (SqlConnection connection = new SqlConnection(strConnString1))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1, connection);
                command.Parameters.Add("@id", Request.QueryString["Lastcategoryid"]);
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();
                Label9.Text = reader["Title"].ToString();
                //core = reader["Categoryid"].ToString();
                reader.Close();
                connection.Close();
            }
          

            //string str11 = " SELECT * FROM Parentcategory Where Id = @Id";
            //using (SqlConnection connection = new SqlConnection(strConnString1))
            //{
            //    //parametrized query to prevent SQL Injection
            //    SqlCommand command = new SqlCommand(str11, connection);
            //    command.Parameters.Add("@Id", core);
            //    connection.Open();
            //    SqlDataReader reader = command.ExecuteReader();
            //    reader.Read();
            //    Label8.Text = reader["Title"].ToString();
            //    reader.Close();
            //    connection.Close();
            //}

            //categoryname.HRef = "Search.aspx?categoryid=" + core;
            //subcategoryname.HRef = "Search.aspx?subcategoryid=" + Request.QueryString["subcategoryid"];

            //categoryname.Style.Add("display", "inline-block");

        }
    
        //else if (Request.QueryString["categoryid"] != null)
        //{
        //    categoryname.Style.Add("display", "inline-block");
        //    cmdstr += " WHERE Categoryid='" + Request.QueryString["categoryid"] + "'";

        //    string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        //    string str1 = " SELECT * FROM Parentcategory Where id = @id";
        //    using (SqlConnection connection = new SqlConnection(strConnString1))
        //    {
        //        //parametrized query to prevent SQL Injection
        //        SqlCommand command = new SqlCommand(str1, connection);
        //        command.Parameters.Add("@id", Request.QueryString["categoryid"]);
        //        connection.Open();
        //        SqlDataReader reader = command.ExecuteReader();
        //        reader.Read();
        //        Label8.Text = reader["Title"].ToString();
        //        reader.Close();
        //        connection.Close();
        //    }

        //    categoryname.HRef = "Search.aspx?categoryid=" + Request.QueryString["categoryid"];
        //}


        cmdstr += " ORDER BY Id DESC";
        SqlCommand cmd = new SqlCommand(cmdstr, conn);
        SqlDataAdapter adp = new SqlDataAdapter(cmd);
        adp.Fill(ds);
        Repeater1.DataSource = ds.Tables[0];
        Repeater1.DataBind();
        if (ds.Tables[0].Rows.Count == 0)
        {
            emptylist.Style.Add("display", "block");
        }
       
        conn.Close();
    }

    protected void Repeater1_ItemDataBound(object sender, System.Web.UI.WebControls.RepeaterItemEventArgs e)
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
}