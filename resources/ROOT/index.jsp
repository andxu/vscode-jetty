<html xmlns=\ "http://www.w3.org/1999/xhtml\" xml:lang=\"en\">
<head>
<META http-equiv="Pragma" content="no-cache">
<META http-equiv="Cache-Control" content="no-cache,no-store">
<META HTTP-EQUIV="Content-Script-Type" CONTENT="text/javascript">
<title>Jetty for VS Code</title>
		<meta charset="UTF-8"></meta>
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
<style type="text/css" title="jetty">
@import url(jetty.css);
</style>
</head>
<body>

  <div id="header"></div>

  <div id="content">
    <h1>War Packages Deployed on this Jetty Server</h1>
  </div>

		<div class="container">
		<%@ page import="java.io.*" %>
		<% 
			String file = application.getRealPath("/");
			File f = new File(file);
			String webappsPath = f.getParent();
			File webapps = new File(webappsPath);
		%>
			<div class="row" style="font-size: 22px;">
				<ul class="list-group">
				<%
					String [] fileNames = webapps.list();
					File [] fileObjects= webapps.listFiles();
					int packagesCount = 0;
					for (int i = 0; i < fileObjects.length; i++) {
						if(fileObjects[i].isDirectory() && !("ROOT").equalsIgnoreCase(fileNames[i])){
							String fname = file+fileNames[i];
							++packagesCount;
				%>
					<li class="list-group-item"><span class="glyphicon glyphicon-folder-close"></span><a href="<%= fileNames[i] %>"> <%= fileNames[i] %></a></li>
				<%
						}
					}
					if (packagesCount == 0) {
				%>
					<h4>No war package</h4>
				<%
					}
				%>
				</ul>
			</div>
		</div>
</body>
</html>
