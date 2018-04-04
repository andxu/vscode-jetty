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
		<%@ page import="java.util.ArrayList" %>
		<%@ page import="java.util.List" %>
		<% 
			File f = new File(application.getRealPath("/"));
			File webapps = new File(f.getParent());
			List<String> warPackages = new ArrayList<String>();
			File[] fileObjects= webapps.listFiles();
			for (int i = 0; i < fileObjects.length; i++) {
				if (!("ROOT").equalsIgnoreCase(fileObjects[i].getName())) {
					String fileName = "";
					if (fileObjects[i].isDirectory()) {
						fileName = fileObjects[i].getName();
					} else if (fileObjects[i].isFile() && fileName.endsWith(".war")) {
						fileName = fileName.substring(0, fileName.indexOf("."));
					}
					if (!warPackages.contains(fileName) && fileName != "") {
						warPackages.add(fileName);
					}
				}
			}
		%>
					<table>
						<% for (int i = 0; i < warPackages.size(); i++) { %>
							<tr>
								<td>
									<ul>
										<li>
											<a href="<%= warPackages.get(i) %>">
												<%= warPackages.get(i) %>
											</a>
										</li>
									</ul>
								</td>
							</tr>
							<% } %>
					</table>
					<% if (warPackages.size() == 0) { %>
						<table>
							<tr>
								<td>No war package deployed on the jetty server.</td>
							</tr>
						</table>
						<% } %>
	</div>
</body>

</html>