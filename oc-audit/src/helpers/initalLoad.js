/* jshint esversion: 6 */

const axios = require('axios');
const Customer = require('mongoose').model('Customer');
const mailer = require('./mailService');

const initialLoad =  async function(array, customer) {
	customer.sitemap = [];

	console.log(`initialLoad begins`);
	
	let sitemap =  await array.map(async (el) => {
		let lastChange 	= "";
		let assets 		= [];
		const source 	= axios.CancelToken.source();

		const content = await axios.get( el.loc[0]+'/?format=json')
			.then(res => res.data)
			.then(data =>  {
				lastChange = data.collection.updatedOn;

				if(data.collection.typeName === "index") {
					assets = data.collection.collections.map(col => col.mainImage ? col.mainImage.assetUrl: null);
					return data.collection.collections.map(col => col.mainContent).join("<br><br>");
					
				} else if(data.collection.typeName === "page") {
					assets = data.collection.mainImage ? data.collection.mainImage.assetUrl : null;
					return data.mainContent;
				}
			}).catch(thrown => {
				if(axios.isCancel(thrown)){
					console.log(thrown.message);
				}else{
					// handle the error here
				}
			});
			
			source.cancel('Request Cancelled.');

		return {
			loc : el.loc[0],
			lastChange: lastChange,
			content: content,
			assets: assets
		}
		});
		
	Promise.all(sitemap).then(results => {
		customer.sitemap = results.filter(res => res.content);
        new Customer(customer).save().then((object) => {
			const html = `
				

			<!--[if (gte mso 9)|(IE)]> <style type="text/css" media="screen"> table {
				border-collapse: collapse;
			}
			
			li {
				text-indent: -1em;
			}
			
			v\:* {
				behavior: url(#default#VML);
			}
			
			</style> <![endif]--> 
			<style type="text/css" media="all"> body,
			.section-text-area,
			.section-text-area-wrapper,
			.section-text-cell {
				/* These are technically the same, but use both */
				overflow-wrap: break-word;
				word-wrap: break-word;
				-ms-word-break: break-all;
				word-break: break-word;
			}
			
			
			
			@media only screen and (min-width: 594px) {
				table#newsletter-table {
					border-top: 44px solid #f7f7f7 !important;
					border-bottom: 44px solid #f7f7f7 !important;
				}
				table#newsletter-email {
					width: 594px;
				}
				table.footer-section p.footer-company-info,
				table.footer-section p.footer-links,
				table.footer-section p.social-links {
					max-width: 352px;
				}
			}
			
			@media only screen and (max-width: 593px) {
				table#newsletter-table {
					border-top: 22px solid #f7f7f7 !important;
					border-bottom: 22px solid #f7f7f7 !important;
				}
				table#newsletter-email {
					width: 414px;
				}
				img.section-scaleable-image {
					width: 100% !important;
					height: auto !important;
				}
				.mobile-only-stacking-cell {
					display: table-cell !important;
				}
				.desktop-only-stacking-cell,
				.horizontal-spacing {
					display: none;
				}
			}
			
			@media only screen and (max-width: 413px) {
				table#newsletter-table {
					border-top: 0px solid #f7f7f7 !important;
					border-bottom: 0px solid #f7f7f7 !important;
				}
				table#newsletter-email {
					width: 100%;
				}
			}
			
			@media yahoo {
				td {
					-webkit-padding-start: none;
				}
			}
			
			span.mail-merge-preview {
				border-bottom: 1px dotted currentColor;
				padding-bottom: .1em;
			}
			
			#text-text-section-0 .section-text-area blockquote {
				padding-left: 20px;
				padding-right: 20px;
			}
			
			#text-text-section-2 .section-text-area blockquote {
				padding-left: 20px;
				padding-right: 20px;
			}
			
			</style><table border="0" cellpadding="0" cellspacing="0" width="100%" align="center" bgcolor="#F7F7F7" id="newsletter-table" style="font-size:16px;font-weight:normal;width:100%;height:100%;margin:0px;padding:0px;border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#f7f7f7;border:0px solid #f7f7f7;"> <tbody><tr> <td align="center" valign="top" id="newsletter-cell" style="font-size:1.125em;width:100%;height:100%;margin:0px;padding:0px;border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;"> 
			
			
			<table border="0" cellpadding="0" cellspacing="0" width="594" id="newsletter-email" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;border:0px solid #f7f7f7;"> <tbody><tr> <td align="center" valign="top" id="newsletter-email-cell" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;"> <table border="0" cellpadding="0" cellspacing="0" width="100%" id="newsletter-email-wrapper" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;"> <tbody><tr> <td align="center" valign="top" class="narrow-sans" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;"> <table border="0" cellpadding="0" cellspacing="0" width="100%" id="newsletter-section-header" style="width:100%;border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;"> <tbody><tr> <td align="center" valign="middle" id="newsletter-section-header-cell" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;"> <div id="header-header-section-stacked-top-0"> <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#FFFFFF" class="section-content header-section header-section-stacked" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;min-width:100%;width:100%;background-color:#fff;"> <tbody><tr> <td align="center" valign="middle" class="section-content-cell section-text-area" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;padding-top:10px;padding-right:0px;padding-bottom:2px;padding-left:0px;"> <a href="https://www.omnicommander.com/?ss_source=sscampaigns&amp;ss_campaign_id=5db88f2f01cbfa2380a20282&amp;ss_email_id=5db9a5c113a5a94d599cf5ee&amp;ss_campaign_name=The+Holiday+Countdown+is+Here&amp;ss_campaign_sent_date=2019-10-30T15%3A04%3A58Z" style="color:#662c90 !important;"><img class="brand-logo" src="https://static1.squarespace.com/static/5841d266f7e0ab54ad7707de/t/5c9b9ac524a69450313e0fd1/1553701580038/logo-stinger.gif" height="110" style="display:block;border:0;outline:none;text-decoration:none;line-height:0;font-size:0;-ms-interpolation-mode:bicubic;color:#0a0b12;height:auto;max-height:110px;max-width:100%;width:auto;"></a> </td> </tr> </tbody></table> </div> </td> </tr> </tbody></table> <table border="0" cellpadding="0" cellspacing="0" width="100%" id="newsletter-section-body" style="width:100%;border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;"> <tbody><tr> <td align="center" valign="top" width="100%" id="newsletter-section-body-cell" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;"> <div id="text-text-section-0"> </div> <div id="text-text-section-2"> <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#FFFFFF" class="text-section section-content" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;min-width:100%;width:100%;"> <tbody><tr> <td valign="top" class="section-text-area section-content-cell" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;padding-top:0px;padding-right:22px;padding-bottom:8px;padding-left:22px;color:#000;background-color:#fff;"> 
				
				<br />
				<h3>Congratulations, you are officially registered for OC SCAN! </
				<p><span style="text-transform="uppercase">${object.name}</span> has been registered </p>
				<p>Moving forward we will be keeping you posted on changes to your website</p>
				<p>Your username is your email ${object.email}</p>
				<p>Password: ${object.code}</p>
				<p>Please save your password in a safe place!</p>
				
				<p> <a href="http://omnicommando.com/welcome"> Visit OC SCAN </a> </p>
				<br /><br />
			
			
			
			
			</td> </tr> </tbody></table> </div> <div id="button-button-section-3"> <table border="0" cellpadding="0" cellspacing="0" bgcolor="#662C90" class="button-section section-content" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;min-width:100%;width:100%;background-color:#662c90;"> <tbody><tr> <td align="center" valign="middle" class="section-content-cell section-text-area" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;padding-top:22px;padding-right:22px;padding-bottom:22px;padding-left:22px;"> <table border="0" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF" class="button-section-box" data-style="rounded" style="border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;width:auto;border-collapse:collapse;background-color:#fff;border-radius:6px;"> <tbody>
				
			<tr> 
				<td align="center" valign="middle" class="button-section-text" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;text-align:center;"> <a class="button-section-link" href="http://omnicommando.com/" style="display:block;font-size:11px;letter-spacing:0em;text-decoration:none;color:#000;"> <span class="button-section-label" style="line-height:inherit;font-family:'Segoe UI', Candara, 'Bitstream Vera Sans', 'DejaVu Sans', 'Trebuchet MS', Verdana, sans-serif;letter-spacing:.2em;border-radius:6px;border-top:solid #fff 16px;border-right:solid #fff 33px;border-bottom:solid #fff 16px;border-left:solid #fff 33px;display:inline-block;font-size:inherit;font-weight:inherit;color:inherit;width:auto;margin:0;min-width:1px;"><strong>OC-Audit v1.2 by Omnicommander</strong></span> </a> </td>
			 </tr>
			 </tbody></table> </td> </tr> </tbody></table> </div> </td> </tr> </tbody></table> <table border="0" cellpadding="0" cellspacing="0" width="100%" id="newsletter-section-footer" style="width:100%;border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;"> <tbody><tr> <td align="center" valign="top" id="newsletter-section-footer-cell" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;"> <div id="footer-footer-section-stacked-top-0"> <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#F7F7F7" class="footer-section footer-section-stacked section-content" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;min-width:100%;width:100%;background-color:#f7f7f7;"> <tbody><tr> <td align="center" valign="top" class="section-text-area section-content-cell" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;padding-top:20px;padding-right:22px;padding-bottom:22px;padding-left:22px;"> <p class="social-links" style="margin-bottom:1.25em;line-height:1.618em;font-weight:normal;margin-top:0;font-family:'Segoe UI', Candara, 'Bitstream Vera Sans', 'DejaVu Sans', 'Trebuchet MS', Verdana, sans-serif;letter-spacing:-.01em;color:#a2a5b3;font-size:11px;"> <!--[if (gte mso 9)|(IE)]> <table cellpadding="0" cellspacing="0"><tr> <![endif]--> <!--[if (gte mso 9)|(IE)]> <td width="41" height="41" valign="bottom" align="center"> <![endif]--> <a href="http://instagram.com/omnicommand" style="color:#662c90 !important;"><img class="social-link-icon" src="https://static3.squarespace.com/static/newsletters/assets/b0589dfe0a47b363f1d92354f704e5d59486aea3/images/email/social-icons/instagram.png" width="30" hspace="10" alt="instagram" style="font-size:.75em;border:0;outline:none;text-decoration:none;line-height:0;-ms-interpolation-mode:bicubic;font-weight:normal;font-family:'Segoe UI', Candara, 'Bitstream Vera Sans', 'DejaVu Sans', 'Trebuchet MS', Verdana, sans-serif;width:30px;height:auto;margin:0 10px;display:inline-block;"></a> <!--[if (gte mso 9)|(IE)]> </td> <![endif]--> <!--[if (gte mso 9)|(IE)]> <td width="41" height="41" valign="bottom" align="center"> <![endif]--> <a href="https://www.facebook.com/OMNICOMMANDER/" style="color:#662c90 !important;"><img class="social-link-icon" src="https://static3.squarespace.com/static/newsletters/assets/b0589dfe0a47b363f1d92354f704e5d59486aea3/images/email/social-icons/facebook.png" width="30" hspace="10" alt="facebook" style="font-size:.75em;border:0;outline:none;text-decoration:none;line-height:0;-ms-interpolation-mode:bicubic;font-weight:normal;font-family:'Segoe UI', Candara, 'Bitstream Vera Sans', 'DejaVu Sans', 'Trebuchet MS', Verdana, sans-serif;width:30px;height:auto;margin:0 10px;display:inline-block;"></a> <!--[if (gte mso 9)|(IE)]> </td> <![endif]--> <!--[if (gte mso 9)|(IE)]> <td width="41" height="41" valign="bottom" align="center"> <![endif]--> <a href="https://www.linkedin.com/company/omnicommander/" style="color:#662c90 !important;"><img class="social-link-icon" src="https://static3.squarespace.com/static/newsletters/assets/b0589dfe0a47b363f1d92354f704e5d59486aea3/images/email/social-icons/linkedin.png" width="30" hspace="10" alt="linkedin" style="font-size:.75em;border:0;outline:none;text-decoration:none;line-height:0;-ms-interpolation-mode:bicubic;font-weight:normal;font-family:'Segoe UI', Candara, 'Bitstream Vera Sans', 'DejaVu Sans', 'Trebuchet MS', Verdana, sans-serif;width:30px;height:auto;margin:0 10px;display:inline-block;"></a> <!--[if (gte mso 9)|(IE)]> </td> <![endif]--> <!--[if (gte mso 9)|(IE)]> <td width="41" height="41" valign="bottom" align="center"> <![endif]--> <a href="https://twitter.com/OMNICOMMANDER1" style="color:#662c90 !important;"><img class="social-link-icon" src="https://static3.squarespace.com/static/newsletters/assets/b0589dfe0a47b363f1d92354f704e5d59486aea3/images/email/social-icons/twitter.png" width="30" hspace="10" alt="twitter" style="font-size:.75em;border:0;outline:none;text-decoration:none;line-height:0;-ms-interpolation-mode:bicubic;font-weight:normal;font-family:'Segoe UI', Candara, 'Bitstream Vera Sans', 'DejaVu Sans', 'Trebuchet MS', Verdana, sans-serif;width:30px;height:auto;margin:0 10px;display:inline-block;"></a> <!--[if (gte mso 9)|(IE)]> </td> <![endif]--> <!--[if (gte mso 9)|(IE)]> </tr></table> <![endif]--> </p> <p class="footer-company-info" style="line-height:1.618em;font-weight:normal;font-family:'Segoe UI', Candara, 'Bitstream Vera Sans', 'DejaVu Sans', 'Trebuchet MS', Verdana, sans-serif;letter-spacing:-.01em;color:#a2a5b3;font-size:11px;margin-top:11px;margin-bottom:11px;"> <a style="color:#a2a5b3;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit;cursor:default;">OMNICOMMANDER,
			495 Grand Blvd Ste 201,
			Miramar Beach,
			Florida,
			United States</a> </p> <p class="footer-company-info" style="line-height:1.618em;font-weight:normal;font-family:'Segoe UI', Candara, 'Bitstream Vera Sans', 'DejaVu Sans', 'Trebuchet MS', Verdana, sans-serif;letter-spacing:-.01em;color:#a2a5b3;font-size:11px;margin-top:11px;margin-bottom:11px;"></p> </td> </tr> <tr> <td align="center" valign="top" class="section-padded-shim" style="border-collapse:collapse;border-spacing:0 !important;border-color:transparent;mso-table-lspace:0pt;mso-table-rspace:0pt;height:0;"></td> </tr> </tbody></table> </div> </td> </tr> </tbody></table> </td> </tr> </tbody></table> </td> </tr> </tbody></table> </td> </tr> </tbody></table>
			
			
			`;




			console.log(`sending successful notifcation to ` + object.email);
			mailer(object.email, 'Successful OC SCAN Registration', html);
		});
	});
}

module.exports =  initialLoad;