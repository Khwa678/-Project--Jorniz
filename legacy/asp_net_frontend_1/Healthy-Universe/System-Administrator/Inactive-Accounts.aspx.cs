using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Drawing;


public partial class System_Administrator_Inactive_Accounts : System.Web.UI.Page
{
    string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
    protected void Page_Load(object sender, EventArgs e)
    {
        success.Style.Add("display", "none");
        failed.Style.Add("display", "none");


        if (!this.IsPostBack)
        {

            BindGrid();

        }

    }
    protected void BindGrid()
    {

        DataTable dt = new DataTable();
        SqlDataAdapter adp = new SqlDataAdapter();
        try
        {
            SqlCommand cmd = new SqlCommand("select * from Sproviders WHERE Status=@Status ORDER BY Id DESC", con);
            adp.SelectCommand = cmd;
            cmd.Parameters.Add("@Status", "Rejected");
          
            adp.Fill(dt);
            if (dt.Rows.Count > 0)
            {
                grdImages.DataSource = dt;
                grdImages.DataBind();
                emptylist.Style.Add("display", "none");
            }
            else
            {
                grdImages.DataSource = null;
                grdImages.DataBind();
                emptylist.Style.Add("display", "block");
            }
        }
        catch (Exception ex)
        {
            //ScriptManager.RegisterStartupScript(this, this.GetType(), "Message", "alert('Error occured : " + ex.Message.ToString() + "');", true);
        }
        finally
        {
            dt.Clear();
            dt.Dispose();
            adp.Dispose();
        }
    }
    protected void grdImages_RowCommand(object sender, GridViewCommandEventArgs e)
    {
        if (e.CommandName == "Advanced")
        {
            string _commandArgument = e.CommandArgument as string;
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con1 = new SqlConnection(constr))
            {
                con1.Open();
                SqlCommand cmd1 = new SqlCommand("update Sproviders set Status=@Status WHERE Id=@Id", con1);
                cmd1.Parameters.AddWithValue("@Status","Active");             
                cmd1.Parameters.AddWithValue("@Id", _commandArgument);
                cmd1.ExecuteNonQuery();
                con1.Close();
            }
            success.Style.Add("display", "block");
            BindGrid();

        }
    }
}