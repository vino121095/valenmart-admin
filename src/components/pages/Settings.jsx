import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Avatar,
  Switch,
  FormControlLabel,
  Stack,
  IconButton,
  InputAdornment,
  Paper
} from '@mui/material';
import {
  SaveRounded,
  CloudUploadRounded,
  FacebookRounded,
  Instagram,
  LinkedIn,
  YouTube,
  InfoRounded,
  LanguageRounded,
  EmailRounded,
  PhoneRounded,
  NotificationsActiveRounded,
  ImageRounded,
  PaletteRounded,
  SettingsRounded,
  BrushRounded,
  HexagonRounded,
  CategoryRounded
} from '@mui/icons-material';
import { styled, alpha, createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00B074',
      light: '#00B074',
      dark: '#059669'
    },
    secondary: {
      main: '#10B981',
      light: '#6EE7B7',
      dark: '#047857'
    },
    error: {
      main: '#F87171',
      light: '#FEE2E2'
    },
    warning: {
      main: '#FBBF24',
      light: '#FEF3C7'
    },
    info: {
      main: '#3B82F6',
      light: '#E0F2FE'
    },
    success: {
      main: '#22C55E',
      light: '#BBF7D0'
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280'
    },
    neumorph: {
      light: '#FFFFFF',
      shadow1: '#D1C4E9',
      shadow2: '#B39DDB'
    }
  },
  typography: {
    fontFamily: ['"Inter"', '"Poppins"', 'sans-serif'].join(','),
    h4: {
      fontWeight: 800,
      letterSpacing: '-1px'
    },
    h6: {
      fontWeight: 700
    }
  },
  shape: {
    borderRadius: 16
  }
});

const NeumorphPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '24px',
  background: theme.palette.background.paper,
  boxShadow: `8px 8px 16px ${theme.palette.neumorph.shadow1}, 
             -8px -8px 16px ${theme.palette.neumorph.light}`,
  border: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `12px 12px 24px ${theme.palette.neumorph.shadow1}, 
               -12px -12px 24px ${theme.palette.neumorph.light}`
  }
}));

const NeumorphButton = styled(Button)(({ theme }) => ({
  borderRadius: '50px',
  background: `linear-gradient(145deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  fontWeight: 700,
  padding: '14px 28px',
  boxShadow: `5px 5px 10px ${alpha(theme.palette.primary.dark, 0.3)}, 
              -5px -5px 10px ${alpha(theme.palette.primary.light, 0.3)}`,
  transition: 'all 0.3s ease',
  textTransform: 'none',
  letterSpacing: '0.5px',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `8px 8px 16px ${alpha(theme.palette.primary.dark, 0.3)}, 
                -8px -8px 16px ${alpha(theme.palette.primary.light, 0.3)}`,
    background: `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
  }
}));

const HexagonalAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `5px 5px 10px ${theme.palette.neumorph.shadow1}, 
             -5px -5px 10px ${theme.palette.neumorph.light}`
}));

const FloatingHexagon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '120px',
  height: '120px',
  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  background: alpha(theme.palette.primary.main, 0.1),
  zIndex: 0
}));

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetch('http://localhost:8000/api/settings/all')
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setSettings({
            ...data[0],
            notification_status: data[0].notification_status || 'on',
          });
        } else {
          setSettings({
            site_name: '',
            site_description: '',
            contact_mail: '',
            facebook_url: '',
            instagram_url: '',
            linkedin_url: '',
            youtube_url: '',
            about: '',
            contact_no: '',
            site_icon: '',
            site_logo: '',
            site_dark_logo: '',
            notification_status: 'on',
          });
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching settings:', error);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (field) => (event) => {
    setSettings((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = () => {
    const formData = new FormData();

    Object.entries(settings).forEach(([key, value]) => {
      if (
        key !== 'site_icon_file' &&
        key !== 'site_logo_file' &&
        key !== 'site_dark_logo_file'
      ) {
        formData.append(key, value);
      }
    });

    if (settings.site_icon_file) {
      formData.append('site_icon', settings.site_icon_file);
    }
    if (settings.site_logo_file) {
      formData.append('site_logo', settings.site_logo_file);
    }
    if (settings.site_dark_logo_file) {
      formData.append('site_dark_logo', settings.site_dark_logo_file);
    }

    fetch('http://localhost:8000/api/settings/create', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        alert('Settings saved successfully!');
      })
      .catch((error) => {
        alert('Failed to save settings.');
        console.error(error);
      });
  };

  const formatImagePath = (path) => path?.replace(/\\/g, '/');

  if (loading || !settings) {
    return (
      <ThemeProvider theme={theme}>
        {/* <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#f5f5f7'
        }}>
          <HexagonalAvatar>
            <SettingsRounded sx={{ fontSize: 50, color: 'white' }} />
          </HexagonalAvatar>
        </Box> */}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        p: { xs: 2, md: 4 },
        minHeight: '100vh',
        background: '#f5f5f7',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <FloatingHexagon sx={{ top: '10%', left: '5%', transform: 'rotate(15deg)' }} />
        <FloatingHexagon sx={{ bottom: '15%', right: '8%', transform: 'rotate(-30deg)' }} />
        <FloatingHexagon sx={{ top: '30%', right: '15%', transform: 'rotate(45deg)', width: '80px', height: '80px' }} />

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          gap: 3,
          position: 'relative',
          zIndex: 1
        }}>
          <SettingsRounded sx={{ fontSize: 50, color: '#00B074' }} />
          <Box>
            <Typography variant="h4" sx={{
              background: '#00B074',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px',
              lineHeight: 1.2
            }}>
              Settings
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <NeumorphPaper sx={{ p: 2 }}>
              <Stack spacing={1}>
                {[
                  { id: 'general', icon: <LanguageRounded />, label: 'General' },
                  { id: 'social', icon: <CategoryRounded />, label: 'Social' },
                  { id: 'branding', icon: <PaletteRounded />, label: 'Branding' }
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    fullWidth
                    startIcon={tab.icon}
                    sx={{
                      justifyContent: 'flex-start',
                      bgcolor: activeTab === tab.id ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      color: activeTab === tab.id ? 'primary.main' : 'text.primary',
                      fontWeight: activeTab === tab.id ? 700 : 500,
                      borderRadius: '14px',
                      textTransform: 'none',
                      p: 2,
                      textAlign: 'left'
                    }}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </Stack>
            </NeumorphPaper>
          </Grid>

          <Grid item xs={12} md={9}>
            {activeTab === 'general' && (
              <NeumorphPaper sx={{ p: 4, mb: 3 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 3,
                  p: 2,
                  background: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: '16px'
                }}>
                  <LanguageRounded color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" sx={{
                    fontWeight: 700,
                    color: '#00B074'
                  }}>
                    Core Configuration
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Platform Name"
                      value={settings.site_name}
                      onChange={handleInputChange('site_name')}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <InfoRounded color="primary" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: '14px' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact Email"
                      value={settings.contact_mail}
                      onChange={handleInputChange('contact_mail')}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailRounded color="primary" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: '14px' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Platform Description"
                      value={settings.site_description}
                      onChange={handleInputChange('site_description')}
                      multiline
                      rows={3}
                      variant="outlined"
                      InputProps={{ sx: { borderRadius: '14px' } }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="About Content"
                      value={settings.about}
                      onChange={handleInputChange('about')}
                      multiline
                      rows={4}
                      variant="outlined"
                      InputProps={{ sx: { borderRadius: '14px' } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact Number"
                      value={settings.contact_no}
                      onChange={handleInputChange('contact_no')}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneRounded color="primary" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: '14px' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <NeumorphPaper sx={{ p: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notification_status === 'on'}
                            color="primary"
                            sx={{
                              '& .MuiSwitch-thumb': {
                                boxShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                              },
                              '& .MuiSwitch-track': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.3),
                                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)'
                              }
                            }}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                notification_status: e.target.checked ? 'on' : 'off',
                              }))
                            }
                          />
                        }
                        label={
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Notification System
                          </Typography>
                        }
                        labelPlacement="start"
                        sx={{
                          justifyContent: 'space-between',
                          ml: 0,
                          width: '100%'
                        }}
                      />
                    </NeumorphPaper>
                  </Grid>
                </Grid>
              </NeumorphPaper>
            )}

            {activeTab === 'social' && (
              <NeumorphPaper sx={{ p: 4, mb: 3 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 3,
                  p: 2,
                  background: alpha(theme.palette.secondary.main, 0.05),
                  borderRadius: '16px'
                }}>
                  <CategoryRounded color="secondary" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" sx={{
                    fontWeight: 700,
                    color: 'secondary.main'
                  }}>
                    Social Connectivity
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Facebook URL"
                      value={settings.facebook_url}
                      onChange={handleInputChange('facebook_url')}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FacebookRounded color="primary" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: '14px' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Instagram URL"
                      value={settings.instagram_url}
                      onChange={handleInputChange('instagram_url')}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Instagram color="secondary" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: '14px' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="LinkedIn URL"
                      value={settings.linkedin_url}
                      onChange={handleInputChange('linkedin_url')}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkedIn color="primary" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: '14px' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="YouTube URL"
                      value={settings.youtube_url}
                      onChange={handleInputChange('youtube_url')}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <YouTube color="error" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: '14px' }
                      }}
                    />
                  </Grid>
                </Grid>
              </NeumorphPaper>
            )}

            {activeTab === 'branding' && (
              <NeumorphPaper sx={{ p: 4 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 3,
                  p: 2,
                  background: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: '16px'
                }}>
                  <PaletteRounded color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" sx={{
                    fontWeight: 700,
                    color: 'primary.main'
                  }}>
                    Visual Identity
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {[
                    { key: 'site_icon', label: 'Favicon', fileKey: 'site_icon_file', icon: <ImageRounded /> },
                    { key: 'site_logo', label: 'Primary Logo', fileKey: 'site_logo_file', icon: <ImageRounded /> },
                    { key: 'site_dark_logo', label: 'Dark Logo', fileKey: 'site_dark_logo_file', icon: <ImageRounded /> }
                  ].map(({ key, label, fileKey, icon }) => (
                    <Grid item xs={12} sm={4} key={key}>
                      <NeumorphPaper sx={{
                        p: 3,
                        height: '100%',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <Typography variant="subtitle1" sx={{
                          fontWeight: 700,
                          mb: 2,
                          color: 'text.primary'
                        }}>
                          {label}
                        </Typography>

                        {settings[key] ? (
                          <HexagonalAvatar
                            alt={label}
                            src={`http://localhost:8000/${formatImagePath(settings[key])}`}
                            sx={{ mb: 2 }}
                          >
                            {icon}
                          </HexagonalAvatar>
                        ) : (
                          <HexagonalAvatar sx={{ mb: 2 }}>
                            {icon}
                          </HexagonalAvatar>
                        )}

                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<CloudUploadRounded />}
                          fullWidth
                          sx={{
                            borderRadius: '50px',
                            fontWeight: 600,
                            textTransform: 'none'
                          }}
                        >
                          Upload
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                [fileKey]: e.target.files[0],
                              }))
                            }
                          />
                        </Button>
                      </NeumorphPaper>
                    </Grid>
                  ))}
                </Grid>
              </NeumorphPaper>
            )}

            <Box sx={{
              mt: 4,
              display: 'flex',
              justifyContent: 'flex-end',
              position: 'relative',
              zIndex: 1
            }}>
              <NeumorphButton
                onClick={handleSave}
                startIcon={<SaveRounded />}
                sx={{
                  background: "#00B074"
                }}
              >
                Commit Changes
              </NeumorphButton>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}