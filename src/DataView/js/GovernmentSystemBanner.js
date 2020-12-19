import React from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import CssBaseline from "@material-ui/core/CssBaseline";
import WarningIcon from "@material-ui/icons/Warning";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";

export default function Banner() {
  const [cookie, setCookie] = React.useState(() => document.cookie.split(';').some((item) => item.trim().startsWith('dismissFismaBanner=')));
  const dismissBanner = () => {
    var expires = new Date();
    expires.setDate(expires.getDate()+30);
    document.cookie = `dismissFismaBanner=true; expires=${expires}`;
    setCookie(true)
  };

  return (
    <React.Fragment>
      {!cookie &&
        <React.Fragment>
          <CssBaseline />
          <Paper elevation={0}>
            <Box pt={2} pr={1} pb={1} pl={2}>
              <Grid container spacing={0} alignItems="flex-start" wrap="nowrap">
                <Grid item>
                  <Box bgcolor="primary.main" clone>
                    <Avatar>
                      <WarningIcon />
                    </Avatar>
                  </Box>
                </Grid>
                <Grid item>
                  <Typography>
                    <ul>
                      <li>This warning banner provides privacy and security notices consistent with applicable federal laws, directives, and other federal guidance for accessing this Government system, which includes (1) this computer network, (2) all computers connected to this network, and (3) all devices and storage media attached to this network or to a computer on this network.</li>
                      <li>This system is provided for Government-authorized use only.</li>
                      <li>Unauthorized or improper use of this system is prohibited and may result in disciplinary action and/or civil and criminal penalties.</li>
                      <li>Personal use of social media and networking sites on this system is limited as to not interfere with official work duties and is subject to monitoring.</li>
                      <li>By using this information system, you understand and consent to the following:</li>
                      <ul>
                        <li>The Government may monitor, record, and audit your system usage, including usage of personal devices and email systems for official duties or to conduct HHS business. Therefore, you have no reasonable expectation of privacy regarding any communication or data transiting or stored on this system. At any time, and for any lawful Government purpose, the government may monitor, intercept, and search and seize any communication or data transiting or stored on this system.</li>
                        <li>Any communication or data transiting or stored on this information system may be disclosed or used for any lawful Government purpose.</li>
                        </ul>
                    </ul>
                  </Typography>
                </Grid>
              </Grid>
              <Grid container justify="flex-end" spacing={8}>
                <Grid item>
                  <Button color="primary" onClick={dismissBanner}>Dismiss</Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          <Divider />
        </React.Fragment>
      }
    </React.Fragment>
  );
}
