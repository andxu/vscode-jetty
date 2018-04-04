<html xmlns=\ "http://www.w3.org/1999/xhtml\" xml:lang=\ "en\">

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
		<h1>War Packages Deployed on the Jetty Server</h1>
	</div>

	<div id="links">
		<%@ page import="java.io.*" %>
			<% 
			String file = application.getRealPath("/");
			File f = new File(file);
			String webappsPath = f.getParent();
			File webapps = new File(webappsPath);
		%>
				<table>
					<%
					String [] fileNames = webapps.list();
					File [] fileObjects= webapps.listFiles();
					int packagesCount = 0;
					for (int i = 0; i < fileObjects.length; i++) {
						if(fileObjects[i].isDirectory() && !("ROOT").equalsIgnoreCase(fileNames[i])) {
							String fname = file+fileNames[i];
							++packagesCount;
				%>
						<tr>
							<td>
								<ul>
									<li>
										<a href="<%= fileNames[i] %>">
											<%= fileNames[i] %>
										</a>
									</li>
								</ul>
							</td>
						</tr>
				</table>
				<%
						}
					}
					if (packagesCount == 0) {
				%>
					<table>
						<tr>
							<td>No war package deployed on the jetty server.</td>
						</tr>
					</table>
					<%
					}
				%>
	</div>
</body>

</html>