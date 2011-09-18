<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="/rss">
        <html>
            <head>
                <title><xsl:value-of select="channel/title" /></title>
                <link href="main.css" rel="stylesheet" type="text/css" />
            </head>
            <body class="feed">
                <div id="wrapper">
                    <h1>
                        <xsl:element name="a">
                            <xsl:attribute name="href">
                                <xsl:value-of select="channel/link" />
                            </xsl:attribute>
                            <xsl:value-of select="channel/title" />
                        </xsl:element>
                    </h1>
                    <ul>
                        <xsl:for-each select="channel/item">
                            <li>
                                <xsl:value-of select="title"/>
                                &#160;
                                <xsl:element name="a">
                                    <xsl:attribute name="class">arrow</xsl:attribute>
                                    <xsl:attribute name="href">
                                        <xsl:value-of select="guid"/>
                                    </xsl:attribute>
                                    ⇾
                                </xsl:element>
                            </li>
                        </xsl:for-each>
                    </ul>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
