using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.IO;

public partial class System_Administrator_Bestsellers : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        btnGetSelected.Enabled = false;
        if (!this.IsPostBack)
        {
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con = new SqlConnection(constr))
            {
                using (SqlCommand cmd = new SqlCommand("SELECT Id, Title FROM Subcategory"))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.Connection = con;
                    con.Open();
                    DropDownList2.DataSource = cmd.ExecuteReader();
                    DropDownList2.DataTextField = "Title";
                    DropDownList2.DataValueField = "Id";
                    DropDownList2.DataBind();
                    con.Close();
                }
            }
            DropDownList2.Items.Insert(0, new ListItem("-- Select Sub Category --", "0"));

        }
    }
    protected void GetSelectedRecords(object sender, EventArgs e)
    {
        try
        {
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con = new SqlConnection(constr))
            {
                using (SqlCommand cmd = new SqlCommand())
                {
                    cmd.CommandText = "UPDATE Products SET [IsSelected] = @IsSelected WHERE Id=@Id";
                    cmd.Connection = con;
                    con.Open();
                    foreach (GridViewRow row in GridView1.Rows)
                    {
                        //Get the HobbyId from the DataKey property.
                        int Id = Convert.ToInt32(GridView1.DataKeys[row.RowIndex].Values[0]);

                        //Get the checked value of the CheckBox.
                        bool isSelected = (row.FindControl("chkSelect") as CheckBox).Checked;

                        //Save to database
                        cmd.Parameters.Clear();
                        cmd.Parameters.AddWithValue("@Id", Id);
                        cmd.Parameters.AddWithValue("@IsSelected", isSelected);
                        cmd.ExecuteNonQuery();
                    }
                    con.Close();
                    DropDownList2.ClearSelection();
                    btnGetSelected.Enabled = false;
                    GridView1.DataSource = null;
                    GridView1.DataBind();
                    Response.Write(@"<script language='javascript'>alert('Operation Success!')</script>");
                }
            }
        }
        catch
        {
            Response.Write(@"<script language='javascript'>alert('Operation Failed! Please Try Again later. In case the problem persists please connect to Support.')</script>");
        }
    }

    protected void DropDownList2_SelectedIndexChanged(object sender, EventArgs e)
    {
        if (DropDownList2.SelectedItem.Value == "0")
        {
            btnGetSelected.Enabled = false;
        }
        else
        {
            DataTable dt = new DataTable();
            SqlDataAdapter adp = new SqlDataAdapter();
            try
            {
                string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                using (SqlConnection con = new SqlConnection(constr))
                {
                    SqlCommand cmd = new SqlCommand("select * from Products WHERE Subcategoryid=@Subcategoryid", con);
                    adp.SelectCommand = cmd;
                    cmd.Parameters.Add("@Subcategoryid", DropDownList2.SelectedItem.Value);
                    adp.Fill(dt);
                    if (dt.Rows.Count > 0)
                    {
                        GridView1.DataSource = dt;
                        GridView1.DataBind();
                        btnGetSelected.Enabled = true;
                     
                    }
                    else
                    {
                        btnGetSelected.Enabled = false;
                        GridView1.DataSource = null;
                        GridView1.DataBind();
                     
                    }
                }
            }
            catch (Exception ex)
            {
                ScriptManager.RegisterStartupScript(this, this.GetType(), "Message", "alert('Error occured : " + ex.Message.ToString() + "');", true);
            }
            finally
            {
                dt.Clear();
                dt.Dispose();
                adp.Dispose();
            }
        }
    }
}