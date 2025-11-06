import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Typography,
  Grid,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { createProject, updateProject, clearError, fetchProjects } from '../store/projectsSlice';
import { Project, ProjectConfig, Indicator } from '../types';
import { MainPromptField } from './MainPromptField';
import { IndicatorsList } from './IndicatorsList';

type ProjectFormContentProps = {
  project?: Project | null;
  onSuccess?: () => void;
};

export const ProjectFormContent: React.FC<ProjectFormContentProps> = ({
  project,
  onSuccess,
}) => {
  const { t } = useTranslation('projects');
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.projects.status);
  const error = useAppSelector((state) => state.projects.error);

  const [title, setTitle] = useState('');
  const [mainPrompt, setMainPrompt] = useState('');
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [wasSubmitted, setWasSubmitted] = useState(false);

  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      let config = project.config as ProjectConfig | any;
      
      // Handle config as JSON string
      if (typeof config === 'string') {
        try {
          config = JSON.parse(config);
        } catch {
          config = null;
        }
      }
      
      // Handle both new ProjectConfig format and legacy format
      if (config && typeof config === 'object' && !Array.isArray(config)) {
        // Extract mainPrompt - check for new format (instructions array) or legacy format (mainPrompt string)
        if (config.mainPrompt !== undefined && config.mainPrompt !== null) {
          // Legacy format: mainPrompt is a string
          setMainPrompt(String(config.mainPrompt));
        } else if (config.instructions && Array.isArray(config.instructions)) {
          // New format: instructions is an array, join with newlines
          setMainPrompt(config.instructions.join('\n'));
        } else {
          setMainPrompt('');
        }
        
        // Extract indicators - check for new format (fields object) or legacy format (indicators array)
        if (config.indicators && Array.isArray(config.indicators)) {
          // Legacy format: indicators is already an array
          const validIndicators = config.indicators.filter(
            (ind: any) => ind && typeof ind === 'object' && ind.name && ind.type
          );
          setIndicators(validIndicators);
        } else if (config.fields && typeof config.fields === 'object') {
          // New format: fields is an object, convert to indicators array
          const fieldsToIndicators: Indicator[] = [];
          let index = 0;
          
          for (const [fieldName, fieldDescription] of Object.entries(config.fields)) {
            if (typeof fieldDescription === 'string') {
              // Parse description like "boolean — indica si la venta fue concretada o altamente probable."
              const parts = fieldDescription.split('—');
              const typePart = parts[0]?.trim().toLowerCase() || 'string';
              const descriptionPart = parts.slice(1).join('—').trim() || '';
              
              // Determine type
              let indicatorType: Indicator['type'] = 'string';
              if (typePart.includes('boolean')) {
                indicatorType = 'boolean';
              } else if (typePart.includes('number')) {
                indicatorType = 'number';
              } else if (typePart.includes('list') || typePart.includes('array')) {
                indicatorType = 'list';
              }
              
              // Get example from output_format.example if available
              let exampleOutput: string | undefined;
              if (config.output_format?.example && typeof config.output_format.example === 'object') {
                const exampleValue = config.output_format.example[fieldName];
                if (exampleValue !== undefined && exampleValue !== null) {
                  exampleOutput = String(exampleValue);
                }
              }
              
              fieldsToIndicators.push({
                id: `indicator_${index}_${fieldName}`,
                name: fieldName,
                type: indicatorType,
                description: descriptionPart || fieldDescription,
                exampleOutput,
              });
              index++;
            }
          }
          
          setIndicators(fieldsToIndicators);
        } else {
          setIndicators([]);
        }
      } else {
        // Config is null, undefined, or invalid - reset to defaults
        setMainPrompt('');
        setIndicators([]);
      }
    } else {
      // No project - reset to defaults
      setTitle('');
      setMainPrompt('');
      setIndicators([]);
    }
    dispatch(clearError());
    setWasSubmitted(false);
  }, [project?._id, project?.config, dispatch]);

  useEffect(() => {
    if (wasSubmitted && status === 'idle' && !error) {
      setWasSubmitted(false);
      if (onSuccess) {
        onSuccess();
      } else {
        dispatch(fetchProjects());
      }
    }
  }, [wasSubmitted, status, error, onSuccess, dispatch]);

  const generateId = () => {
    return `indicator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddIndicator = () => {
    const newIndicator: Indicator = {
      id: generateId(),
      name: '',
      type: 'string',
      description: '',
      exampleOutput: '',
    };
    setIndicators([...indicators, newIndicator]);
  };

  const handleUpdateIndicator = (updatedIndicator: Indicator) => {
    setIndicators(
      indicators.map((ind) => (ind.id === updatedIndicator.id ? updatedIndicator : ind))
    );
  };

  const handleDeleteIndicator = (id: string) => {
    setIndicators(indicators.filter((ind) => ind.id !== id));
  };

  const handleJsonConfigChange = (jsonString: string) => {
    try {
      const parsedConfig = JSON.parse(jsonString);
      
      // Update mainPrompt from instructions array
      if (parsedConfig.instructions && Array.isArray(parsedConfig.instructions)) {
        setMainPrompt(parsedConfig.instructions.join('\n'));
      } else if (parsedConfig.mainPrompt !== undefined) {
        setMainPrompt(String(parsedConfig.mainPrompt));
      }
      
      // Update indicators from fields object
      if (parsedConfig.fields && typeof parsedConfig.fields === 'object') {
        const fieldsToIndicators: Indicator[] = [];
        let index = 0;
        
        for (const [fieldName, fieldDescription] of Object.entries(parsedConfig.fields)) {
          if (typeof fieldDescription === 'string') {
            const parts = fieldDescription.split('—');
            const typePart = parts[0]?.trim().toLowerCase() || 'string';
            const descriptionPart = parts.slice(1).join('—').trim() || '';
            
            let indicatorType: Indicator['type'] = 'string';
            if (typePart.includes('boolean')) {
              indicatorType = 'boolean';
            } else if (typePart.includes('number')) {
              indicatorType = 'number';
            } else if (typePart.includes('list') || typePart.includes('array')) {
              indicatorType = 'list';
            }
            
            let exampleOutput: string | undefined;
            if (parsedConfig.output_format?.example && typeof parsedConfig.output_format.example === 'object') {
              const exampleValue = parsedConfig.output_format.example[fieldName];
              if (exampleValue !== undefined && exampleValue !== null) {
                exampleOutput = String(exampleValue);
              }
            }
            
            fieldsToIndicators.push({
              id: `indicator_${index}_${fieldName}`,
              name: fieldName,
              type: indicatorType,
              description: descriptionPart || fieldDescription,
              exampleOutput,
            });
            index++;
          }
        }
        
        setIndicators(fieldsToIndicators);
      } else if (parsedConfig.indicators && Array.isArray(parsedConfig.indicators)) {
        const validIndicators = parsedConfig.indicators.filter(
          (ind: any) => ind && typeof ind === 'object' && ind.name && ind.type
        );
        setIndicators(validIndicators);
      }
    } catch (error) {
      // Invalid JSON - don't update state
      console.error('Invalid JSON config:', error);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      return;
    }

    // Build config in the format expected by the backend
    const config: any = {};
    
    // Convert mainPrompt to instructions array (split by newlines)
    if (mainPrompt.trim()) {
      config.instructions = mainPrompt
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }
    
    // Convert indicators array to fields object and output_format.example
    if (indicators.length > 0) {
      const fields: Record<string, string> = {};
      const example: Record<string, any> = {};
      
      indicators.forEach((indicator) => {
        // Build field description: "type — description"
        const typeLabel = indicator.type;
        const description = indicator.description || '';
        fields[indicator.name] = `${typeLabel} — ${description}`;
        
        // Add to example if exampleOutput is provided
        if (indicator.exampleOutput !== undefined && indicator.exampleOutput !== null && indicator.exampleOutput.trim() !== '') {
          // Convert exampleOutput string to appropriate type
          let exampleValue: any = indicator.exampleOutput.trim();
          
          if (indicator.type === 'boolean') {
            exampleValue = exampleValue.toLowerCase() === 'true';
          } else if (indicator.type === 'number') {
            const numValue = Number(exampleValue);
            exampleValue = isNaN(numValue) ? null : numValue;
          } else if (indicator.type === 'list') {
            try {
              exampleValue = JSON.parse(exampleValue);
            } catch {
              exampleValue = exampleValue.split(',').map((item: string) => item.trim());
            }
          }
          
          example[indicator.name] = exampleValue;
        } else {
          // Use null for missing examples
          example[indicator.name] = null;
        }
      });
      
      config.fields = fields;
      config.output_format = {
        type: 'json',
        example,
      };
    }

    setWasSubmitted(true);

    if (project) {
      dispatch(
        updateProject({
          id: project._id,
          title: title.trim(),
          config,
        })
      );
    } else {
      dispatch(
        createProject({
          title: title.trim(),
          config,
        })
      );
    }
  };

  const buildConfigJson = () => {
    const config: any = {};
    
    if (mainPrompt.trim()) {
      config.instructions = mainPrompt
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }
    
    if (indicators.length > 0) {
      const fields: Record<string, string> = {};
      const example: Record<string, any> = {};
      
      indicators.forEach((indicator) => {
        const typeLabel = indicator.type;
        const description = indicator.description || '';
        fields[indicator.name] = `${typeLabel} — ${description}`;
        
        if (indicator.exampleOutput !== undefined && indicator.exampleOutput !== null && indicator.exampleOutput.trim() !== '') {
          let exampleValue: any = indicator.exampleOutput.trim();
          
          if (indicator.type === 'boolean') {
            exampleValue = exampleValue.toLowerCase() === 'true';
          } else if (indicator.type === 'number') {
            const numValue = Number(exampleValue);
            exampleValue = isNaN(numValue) ? null : numValue;
          } else if (indicator.type === 'list') {
            try {
              exampleValue = JSON.parse(exampleValue);
            } catch {
              exampleValue = exampleValue.split(',').map((item: string) => item.trim());
            }
          }
          
          example[indicator.name] = exampleValue;
        } else {
          example[indicator.name] = null;
        }
      });
      
      config.fields = fields;
      config.output_format = {
        type: 'json',
        example,
      };
    }
    
    return JSON.stringify(config, null, 2);
  };

  const isEditMode = !!project;
  const isLoading = status === 'loading';
  const canSave = title.trim().length > 0 && !isLoading;
  const configJson = buildConfigJson();

  return (
    <Box component="div" width="100%" sx={{ py: 1 }}>
      <Paper elevation={3} sx={{ p: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          {isEditMode ? t('edit_project') : t('create_project')}
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minHeight: 0 }}>
                <TextField
                  label={t('project_title')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                  required
                  disabled={isLoading}
                  placeholder={t('project_title_placeholder')}
                />

                <MainPromptField
                  value={mainPrompt}
                  onChange={setMainPrompt}
                  jsonConfig={configJson}
                  onJsonConfigChange={handleJsonConfigChange}
                  disabled={isLoading}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <IndicatorsList
                indicators={indicators}
                onAdd={handleAddIndicator}
                onUpdate={handleUpdateIndicator}
                onDelete={handleDeleteIndicator}
                disabled={isLoading}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                if (onSuccess) {
                  onSuccess();
                }
              }}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!canSave}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? t('loading') : t('save')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

