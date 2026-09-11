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
using System.Net;
using System.Collections.Specialized;
using System.Net.Mail;
using System.Text;
using System.Security.Cryptography;
public partial class _Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        //success.Style.Add("display", "none");
        //error3.Style.Add("display", "none");
        //P1.Style.Add("display", "none");
        //P2.Style.Add("display", "none");
        // TextBox7.Attributes["min"] = DateTime.Now.ToString("yyyy-MM-dd");
        BindData1();
        BindData2();
        BindData5();
        BindData4();
        BindData7();
        BindData3();
        BindData8();


        if (!this.IsPostBack)
        {
           
           //BindData9();
        }

        Int32 count1 = 0;
        SqlConnection con1 = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
        con1.Open();
        SqlCommand cmd1 = new SqlCommand("select count(Id) from Bannervideo", con1);
        count1 = (Int32)cmd1.ExecuteScalar();
        con1.Close();

        if (count1 > 0)
        {
            string videopath;
            string strConnString11 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            string str1xyz = " SELECT TOP (1) * FROM Bannervideo ORDER BY Id DESC";
            using (SqlConnection connection = new SqlConnection(strConnString11))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1xyz, connection);
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();
                videopath = reader["Path1"].ToString();
                reader.Close();
                connection.Close();

            }
            //video1.Attributes["src"] = videopath;

            string murl = string.Empty;
            string mtitle = string.Empty;
            string mdescription = string.Empty;
            string str1xyz1 = " SELECT * FROM Login WHERE Id=@Id";
            using (SqlConnection connection = new SqlConnection(strConnString11))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1xyz1, connection);
                command.Parameters.Add("@Id", "1");
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();
                murl = reader["Metaurl"].ToString();
                mtitle = reader["Metatitle"].ToString();
                mdescription = reader["Metadescription"].ToString();
                reader.Close();
                connection.Close();

            }
            this.Page.Title = mtitle;
            this.Page.MetaDescription = mdescription;

        }
        else
        {
            //video1.Style.Add("display", "none");
        }
    }
    protected string GetTitle(object obj)
    {
        return obj.ToString().Replace(' ', '-');
    }
    protected void BindData1()
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection conn = new SqlConnection(constring);
        DataSet ds = new DataSet();
        DataTable FromTable = new DataTable();
        conn.Open();
        string cmdstr = "Select * From Banners ORDER BY ID DESC";
        SqlCommand cmd = new SqlCommand(cmdstr, conn);
        SqlDataAdapter adp = new SqlDataAdapter(cmd);
        adp.Fill(ds);
        Repeater1.DataSource = ds.Tables[0];
        Repeater1.DataBind();
        conn.Close();
      
    }

    protected void BindData8()
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection conn = new SqlConnection(constring);
        DataSet ds = new DataSet();
        DataTable FromTable = new DataTable();
        conn.Open();
        string cmdstr = "Select * From Servicecategory ORDER BY ID DESC";
        SqlCommand cmd = new SqlCommand(cmdstr, conn);
        SqlDataAdapter adp = new SqlDataAdapter(cmd);
        adp.Fill(ds);
        Repeater8.DataSource = ds.Tables[0];
        Repeater8.DataBind();
        conn.Close();
     
    }
    protected void BindData7()
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection conn = new SqlConnection(constring);
        DataSet ds = new DataSet();
        DataTable FromTable = new DataTable();
        conn.Open();
        string cmdstr = "Select * From Products WHERE IsSelected=@IsSelected";
        SqlCommand cmd = new SqlCommand(cmdstr, conn);
        cmd.Parameters.Add("@IsSelected", true);
        SqlDataAdapter adp = new SqlDataAdapter(cmd);
        adp.Fill(ds);
        Repeater7.DataSource = ds.Tables[0];
        Repeater7.DataBind();
        conn.Close();
      
    }

    protected void BindData2()
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection conn = new SqlConnection(constring);
        DataSet ds = new DataSet();
        DataTable FromTable = new DataTable();
        conn.Open();
        string cmdstr = "Select TOP (4) * From Parentcategory ORDER BY Id ASC";
        SqlCommand cmd = new SqlCommand(cmdstr, conn);
        SqlDataAdapter adp = new SqlDataAdapter(cmd);
        adp.Fill(ds);
        Repeater91.DataSource = ds.Tables[0];
        Repeater91.DataBind();
        conn.Close();
     
    }


    protected void Repeater7_ItemDataBound(object sender, System.Web.UI.WebControls.RepeaterItemEventArgs e)
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


    //private void BindData3()
    //{
    //    try
    //    {
    //        DataTable dt = new DataTable();
    //        SqlDataAdapter adp = new SqlDataAdapter();
    //        string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    //        using (SqlConnection con = new SqlConnection(constr))
    //        {
    //            SqlCommand cmd = new SqlCommand("select TOP (3) * from Blogs ORDER BY Id ASC", con);
    //            adp.SelectCommand = cmd;
    //            adp.Fill(dt);
    //            if (dt.Rows.Count > 0)
    //            {
    //                Repeater3.DataSource = dt;
    //                Repeater3.DataBind();
    //            }
    //            else
    //            {
    //                Repeater3.DataSource = null;
    //                Repeater3.DataBind();
    //            }
    //        }
    //        dt.Clear();
    //        dt.Dispose();
    //        adp.Dispose();
    //    }
    //    catch
    //    {
    //        Response.Redirect("Error.aspx");
    //    }
    //}
    protected void BindData5()
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection conn = new SqlConnection(constring);
        DataSet ds = new DataSet();
        DataTable FromTable = new DataTable();
        conn.Open();
        string cmdstr = "Select TOP (12) * From Subcategory ORDER BY Id ASC";
        SqlCommand cmd = new SqlCommand(cmdstr, conn);
        SqlDataAdapter adp = new SqlDataAdapter(cmd);
        adp.Fill(ds);
        Repeater5.DataSource = ds.Tables[0];
        Repeater5.DataBind();
        conn.Close();
    }
    protected void BindData4()
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection conn = new SqlConnection(constring);
        DataSet ds = new DataSet();
        DataTable FromTable = new DataTable();
        conn.Open();
        string cmdstr = "Select TOP (6) * From Dbanners ORDER BY Id ASC";
        SqlCommand cmd = new SqlCommand(cmdstr, conn);
        SqlDataAdapter adp = new SqlDataAdapter(cmd);
        adp.Fill(ds);
        Repeater4.DataSource = ds.Tables[0];
        Repeater4.DataBind();
        conn.Close();
    }
    protected void BindData3()
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection conn = new SqlConnection(constring);
        DataSet ds = new DataSet();
        DataTable FromTable = new DataTable();
        conn.Open();
        string cmdstr = "Select TOP (6) * From Products ORDER BY Id DESC";
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
    //protected void BindData6()
    //{
    //    string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    //    SqlConnection conn = new SqlConnection(constring);
    //    DataSet ds = new DataSet();
    //    DataTable FromTable = new DataTable();
    //    conn.Open();
    //    string cmdstr = "Select TOP (4) * From Labs WHERE Status=@Status ORDER BY Id DESC";
    //    SqlCommand cmd = new SqlCommand(cmdstr, conn);
    //    cmd.Parameters.Add("@Status", "1");
    //    SqlDataAdapter adp = new SqlDataAdapter(cmd);
    //    adp.Fill(ds);
    //    Repeater6.DataSource = ds.Tables[0];
    //    Repeater6.DataBind();
    //    conn.Close();
    //}

    //protected void BindData8()
    //{
    //    string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    //    SqlConnection conn = new SqlConnection(constring);
    //    DataSet ds = new DataSet();
    //    DataTable FromTable = new DataTable();
    //    conn.Open();
    //    string cmdstr = "Select TOP (4) * From Centers WHERE Status=@Status ORDER BY Id DESC";
    //    SqlCommand cmd = new SqlCommand(cmdstr, conn);
    //    cmd.Parameters.Add("@Status", "1");
    //    SqlDataAdapter adp = new SqlDataAdapter(cmd);
    //    adp.Fill(ds);
    //    Repeater8.DataSource = ds.Tables[0];
    //    Repeater8.DataBind();
    //    conn.Close();
    //}
    //protected void BindData9()
    //{
    //    string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    //    SqlConnection conn = new SqlConnection(constring);
    //    DataSet ds = new DataSet();
    //    DataTable FromTable = new DataTable();
    //    conn.Open();
    //    string cmdstr = "Select * From Tests WHERE IsSelected=@IsSelected ORDER BY Id DESC";
    //    SqlCommand cmd = new SqlCommand(cmdstr, conn);
    //    cmd.Parameters.Add("@IsSelected", true);
    //    SqlDataAdapter adp = new SqlDataAdapter(cmd);
    //    adp.Fill(ds);
    //    Repeater9.DataSource = ds.Tables[0];
    //    Repeater9.DataBind();
    //    conn.Close();
    //}

    //protected void Button1_Click(object sender, EventArgs e)
    //{
    //    try
    //    {
    //        string From = "info@labprovider.com";
    //        string EmailID = ConfigurationManager.AppSettings["UserName"];
    //        string Subject = "Automated: Callback Request Received | Lab Provider";
    //        string Message = "Name: " + TextBox1.Text + "<br/>Email Address:" + TextBox2.Text + "<br/>Contact No:" + TextBox3.Text;

    //        _Mail.SendMail(EmailID, Subject, Message, From);

    //        TextBox1.Text = string.Empty;
    //        TextBox2.Text = string.Empty;
    //        TextBox3.Text = string.Empty;

    //        success.Style.Add("display", "block");
    //    }
    //    catch
    //    {
    //        error3.Style.Add("display", "block");
    //    }
    //}

    //protected void Button2_Click(object sender, EventArgs e)
    //{
    //    try
    //    {
    //        string From = "corporateemailservice@lyndata.com";
    //        string EmailID = "info@labprovider.com";
    //        string Subject = "Automated: Consultation Query Received | Lab Provider";
    //        string Message = "Patient Name: " + TextBox4.Text + "<br/>Age:" + TextBox5.Text + "<br/>Gender:" + DropDownList1.SelectedItem.Text + "<br/>Contact:" + TextBox6.Text + "<br/>Tests Type:" + DropDownList2.SelectedItem.Text + "<br/>Tests Name" + DropDownList3.SelectedItem.Text + "<br/>Booking Date" + TextBox7.Text + "<br/>Booking Time" + TextBox8.Text + "<br/>Address" + TextBox9.Text + "<br/>City" + TextBox10.Text;
    //        _Mail.SendMail(EmailID, Subject, Message, From);

    //        TextBox4.Text = string.Empty;
    //        TextBox5.Text = string.Empty;
    //        TextBox6.Text = string.Empty;
    //        TextBox7.Text = string.Empty;
    //        TextBox8.Text = string.Empty;
    //        TextBox9.Text = string.Empty;
    //        TextBox10.Text = string.Empty;

    //        DropDownList1.ClearSelection();
    //        DropDownList2.ClearSelection();
    //        DropDownList3.ClearSelection();

    //       P1.Style.Add("display", "block");
    //    }
    //    catch
    //    {
    //       P2.Style.Add("display", "block");
    //    }
    //}

    protected void Repeater9_ItemDataBound(object sender, RepeaterItemEventArgs e)
    {
        if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
        {
            string strConnString = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            RepeaterItem item = e.Item;

            string priceoriginal = (item.FindControl("Label1") as Label).Text;
            string retailprice = (item.FindControl("Label2") as Label).Text;
          
            HtmlGenericControl sample1 = e.Item.FindControl("display1") as HtmlGenericControl;
           
            try
            {
                if (priceoriginal == retailprice)
                {
                    sample1.Style.Add("display", "none");
                }
                else
                {
                    sample1.Style.Add("display", "inline-block");
                }
            }
            catch
            {
                sample1.Style.Add("display", "none");
            }
        }
    }
}