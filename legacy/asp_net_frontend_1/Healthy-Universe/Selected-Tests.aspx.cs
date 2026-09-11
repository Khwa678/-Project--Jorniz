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

public partial class Selected_Tests : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        //string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;    
        //using (SqlConnection con = new SqlConnection(constr))
        //{
        //    using (SqlCommand cmd = new SqlCommand("SELECT Id, Email FROM Sproviders"))
        //    {
        //        cmd.CommandType = CommandType.Text;
        //        cmd.Connection = con;
        //        con.Open();
        //        DropDownList2.DataSource = cmd.ExecuteReader();
        //        DropDownList2.DataTextField = "Email";
        //        DropDownList2.DataValueField = "Id";
        //        DropDownList2.DataBind();
        //        con.Close();
        //    }
        //}
        //DropDownList2.Items.Insert(0, new ListItem("--Select Vendor--", "0"));

        BindData3();
        BindData5();
    }
 
    protected void BindData3()
    {
        try
        {
            string categoryid = Request.QueryString["categoryid"];
            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection conn = new SqlConnection(constring);
            DataSet ds = new DataSet();
            DataTable FromTable = new DataTable();
            conn.Open();
            string cmdstr = "Select * From Tests Where Categoryid = @categoryid";
            SqlCommand cmd = new SqlCommand(cmdstr, conn);
            cmd.Parameters.Add("@Categoryid", categoryid);
            SqlDataAdapter adp = new SqlDataAdapter(cmd);
            adp.Fill(ds);
            Repeater3.DataSource = ds.Tables[0];
            Repeater3.DataBind();
            conn.Close();



        }
        catch
        {
            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection conn = new SqlConnection(constring);
            DataSet ds = new DataSet();
            DataTable FromTable = new DataTable();
            conn.Open();
            string cmdstr = "Select * From Tests order by id desc ";
            SqlCommand cmd = new SqlCommand(cmdstr, conn);
            SqlDataAdapter adp = new SqlDataAdapter(cmd);
            adp.Fill(ds);
            Repeater3.DataSource = ds.Tables[0];
            Repeater3.DataBind();
            conn.Close();
        }
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
    protected void BindData5()
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection conn = new SqlConnection(constring);
        DataSet ds = new DataSet();
        DataTable FromTable = new DataTable();
        conn.Open();
        string cmdstr = "Select * From Ldepartments ORDER BY Id ASC";
        SqlCommand cmd = new SqlCommand(cmdstr, conn);
        SqlDataAdapter adp = new SqlDataAdapter(cmd);
        adp.Fill(ds);
        Repeater5.DataSource = ds.Tables[0];
        Repeater5.DataBind();
        conn.Close();
    }

    //protected void DropDownList2_SelectedIndexChanged(object sender, EventArgs e)
    //{
    //    string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    //    SqlConnection con = new SqlConnection(constring);
    //    DataTable dt = new DataTable();
    //    SqlDataAdapter adp = new SqlDataAdapter();
    //    try
    //    {
    //        SqlCommand cmd = new SqlCommand("select * from Tests WHERE Vid1=@Vid1 ORDER BY Id DESC", con);
    //        adp.SelectCommand = cmd;
    //        cmd.Parameters.Add("@Vid1", DropDownList2.SelectedItem.Value);
    //        adp.Fill(dt);
    //        if (dt.Rows.Count > 0)
    //        {
    //            Repeater3.DataSource = dt;
    //            Repeater3.DataBind();
              
    //        }
    //        else
    //        {
    //            Repeater3.DataSource = null;
    //            Repeater3.DataBind();
    //        }
    //    }
    //    catch (Exception ex)
    //    {
    //        //ScriptManager.RegisterStartupScript(this, this.GetType(), "Message", "alert('Error occured : " + ex.Message.ToString() + "');", true);
    //    }
    //    finally
    //    {
    //        dt.Clear();
    //        dt.Dispose();
    //        adp.Dispose();
    //    }
    //}
}