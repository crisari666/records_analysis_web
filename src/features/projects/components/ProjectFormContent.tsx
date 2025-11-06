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
import { Project, ProjectConfig, Indicator, ExampleAnalysis } from '../types';
import { MainPromptField } from './MainPromptField';
import { IndicatorsList } from './IndicatorsList';
import { TrainingDataDialog } from './TrainingDataDialog';
import { TrainingDataDisplay } from './TrainingDataDisplay';
import { ExampleAnalysesList } from './ExampleAnalysesList';

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
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [mainPrompt, setMainPrompt] = useState('');
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [exampleAnalyses, setExampleAnalyses] = useState<ExampleAnalysis[]>([]);
  const [exampleAnalysesFail, setExampleAnalysesFail] = useState<ExampleAnalysis[]>([]);
  const [examplesAnalysis, setExamplesAnalysis] = useState<Record<string, ExampleAnalysis>>({});
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const [trainingDataDialogOpen, setTrainingDataDialogOpen] = useState(false);
  const [trainingDataDialogType, setTrainingDataDialogType] = useState<'success' | 'fail'>('success');
  const [editingTrainingDataIndex, setEditingTrainingDataIndex] = useState<number | null>(null);
  const [editingExampleKey, setEditingExampleKey] = useState<string | null>(null);

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
        // Extract config name, description, and domain
        setConfigName(config.name || '');
        setConfigDescription(config.description || '');
        setDomain(config.domain || '');
        
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
        
        // Extract example analyses - handle new format (examples_analysis object) or legacy format (arrays)
        if (config.examples_analysis && typeof config.examples_analysis === 'object' && !Array.isArray(config.examples_analysis)) {
          // New format: examples_analysis is an object
          setExamplesAnalysis(config.examples_analysis);
          setExampleAnalyses([]);
          setExampleAnalysesFail([]);
        } else {
          // Legacy format: handle example_analysis and example_analysis_fail arrays
          setExamplesAnalysis({});
          
          if (config.example_analysis) {
            if (Array.isArray(config.example_analysis)) {
              setExampleAnalyses(config.example_analysis);
            } else if (typeof config.example_analysis === 'object' && config.example_analysis.input !== undefined) {
              // Single example, convert to array
              setExampleAnalyses([config.example_analysis]);
            } else {
              setExampleAnalyses([]);
            }
          } else {
            setExampleAnalyses([]);
          }
          
          if (config.example_analysis_fail) {
            if (Array.isArray(config.example_analysis_fail)) {
              setExampleAnalysesFail(config.example_analysis_fail);
            } else if (typeof config.example_analysis_fail === 'object' && config.example_analysis_fail.input !== undefined) {
              // Single example, convert to array
              setExampleAnalysesFail([config.example_analysis_fail]);
            } else {
              setExampleAnalysesFail([]);
            }
          } else {
            setExampleAnalysesFail([]);
          }
        }
      } else {
        // Config is null, undefined, or invalid - reset to defaults
        setConfigName('');
        setConfigDescription('');
        setDomain('');
        setMainPrompt('');
        setIndicators([]);
        setExampleAnalyses([]);
        setExampleAnalysesFail([]);
        setExamplesAnalysis({});
      }
    } else {
      // No project - reset to defaults
      setTitle('');
      setConfigName('');
      setConfigDescription('');
      setDomain('');
      setMainPrompt('');
      setIndicators([]);
      setExampleAnalyses([]);
      setExampleAnalysesFail([]);
      setExamplesAnalysis({});
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
      
      // Update config name, description, and domain
      setConfigName(parsedConfig.name || '');
      setConfigDescription(parsedConfig.description || '');
      setDomain(parsedConfig.domain || '');
      
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
      
      // Update example analyses - handle new format (examples_analysis object) or legacy format
      if (parsedConfig.examples_analysis && typeof parsedConfig.examples_analysis === 'object' && !Array.isArray(parsedConfig.examples_analysis)) {
        setExamplesAnalysis(parsedConfig.examples_analysis);
        setExampleAnalyses([]);
        setExampleAnalysesFail([]);
      } else {
        setExamplesAnalysis({});
        
        if (parsedConfig.example_analysis) {
          if (Array.isArray(parsedConfig.example_analysis)) {
            setExampleAnalyses(parsedConfig.example_analysis);
          } else if (typeof parsedConfig.example_analysis === 'object' && parsedConfig.example_analysis.input !== undefined) {
            setExampleAnalyses([parsedConfig.example_analysis]);
          } else {
            setExampleAnalyses([]);
          }
        } else {
          setExampleAnalyses([]);
        }
        
        if (parsedConfig.example_analysis_fail) {
          if (Array.isArray(parsedConfig.example_analysis_fail)) {
            setExampleAnalysesFail(parsedConfig.example_analysis_fail);
          } else if (typeof parsedConfig.example_analysis_fail === 'object' && parsedConfig.example_analysis_fail.input !== undefined) {
            setExampleAnalysesFail([parsedConfig.example_analysis_fail]);
          } else {
            setExampleAnalysesFail([]);
          }
        } else {
          setExampleAnalysesFail([]);
        }
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
    
    // Add config name, description, and domain
    if (configName.trim()) {
      config.name = configName.trim();
    }
    
    if (configDescription.trim()) {
      config.description = configDescription.trim();
    }
    
    if (domain.trim()) {
      config.domain = domain.trim();
    }
    
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
    
    // Add example analyses - prefer new format (examples_analysis object) if available
    if (Object.keys(examplesAnalysis).length > 0) {
      config.examples_analysis = examplesAnalysis;
    } else {
      // Legacy format: save as arrays
      if (exampleAnalyses.length > 0) {
        config.example_analysis = exampleAnalyses;
      }
      
      if (exampleAnalysesFail.length > 0) {
        config.example_analysis_fail = exampleAnalysesFail;
      }
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
    
    if (configName.trim()) {
      config.name = configName.trim();
    }
    
    if (configDescription.trim()) {
      config.description = configDescription.trim();
    }
    
    if (domain.trim()) {
      config.domain = domain.trim();
    }
    
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
    
    // Prefer new format (examples_analysis object) if available
    if (Object.keys(examplesAnalysis).length > 0) {
      config.examples_analysis = examplesAnalysis;
    } else {
      // Legacy format: save as arrays
      if (exampleAnalyses.length > 0) {
        config.example_analysis = exampleAnalyses;
      }
      
      if (exampleAnalysesFail.length > 0) {
        config.example_analysis_fail = exampleAnalysesFail;
      }
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
                  size="small"
                />

                <TextField
                  label={t('config_name')}
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  fullWidth
                  disabled={isLoading}
                  placeholder={t('config_name_placeholder')}
                  size="small"
                />

                <TextField
                  label={t('config_description')}
                  value={configDescription}
                  onChange={(e) => setConfigDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={isLoading}
                  placeholder={t('config_description_placeholder')}
                  size="small"
                />

                <TextField
                  label={t('config_domain')}
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  fullWidth
                  disabled={isLoading}
                  placeholder={t('config_domain_placeholder')}
                  size="small"
                />

                <MainPromptField
                  value={mainPrompt}
                  onChange={setMainPrompt}
                  jsonConfig={configJson}
                  onJsonConfigChange={handleJsonConfigChange}
                  disabled={isLoading}
                />

                <Box sx={{ mt: 2 }}>
                  {Object.keys(examplesAnalysis).length > 0 ? (
                    <ExampleAnalysesList
                      examples={examplesAnalysis}
                      onEdit={(key: string) => {
                        setEditingExampleKey(key);
                        setTrainingDataDialogOpen(true);
                      }}
                      onDelete={(key: string) => {
                        const newExamples = { ...examplesAnalysis };
                        delete newExamples[key];
                        setExamplesAnalysis(newExamples);
                      }}
                      onAdd={() => {
                        setEditingExampleKey(null);
                        setTrainingDataDialogOpen(true);
                      }}
                      indicators={indicators}
                      disabled={isLoading}
                    />
                  ) : (
                    <>
                      <TrainingDataDisplay
                        examples={exampleAnalyses}
                        onEdit={(index) => {
                          setEditingTrainingDataIndex(index);
                          setTrainingDataDialogType('success');
                          setTrainingDataDialogOpen(true);
                        }}
                        onDelete={(index) => {
                          setExampleAnalyses(exampleAnalyses.filter((_, i) => i !== index));
                        }}
                        onAdd={() => {
                          setEditingTrainingDataIndex(null);
                          setTrainingDataDialogType('success');
                          setTrainingDataDialogOpen(true);
                        }}
                        indicators={indicators}
                        disabled={isLoading}
                      />
                      <Box sx={{ mt: 2 }}>
                        <TrainingDataDisplay
                          examples={exampleAnalysesFail}
                          onEdit={(index) => {
                            setEditingTrainingDataIndex(index);
                            setTrainingDataDialogType('fail');
                            setTrainingDataDialogOpen(true);
                          }}
                          onDelete={(index) => {
                            setExampleAnalysesFail(exampleAnalysesFail.filter((_, i) => i !== index));
                          }}
                          onAdd={() => {
                            setEditingTrainingDataIndex(null);
                            setTrainingDataDialogType('fail');
                            setTrainingDataDialogOpen(true);
                          }}
                          indicators={indicators}
                          disabled={isLoading}
                        />
                      </Box>
                    </>
                  )}
                </Box>
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

      <TrainingDataDialog
        open={trainingDataDialogOpen}
        onClose={() => {
          setTrainingDataDialogOpen(false);
          setEditingTrainingDataIndex(null);
          setEditingExampleKey(null);
        }}
        onSave={(example) => {
          // Handle new format (examples_analysis object)
          if (editingExampleKey !== null || Object.keys(examplesAnalysis).length > 0) {
            const key = example.name?.trim() || editingExampleKey || `example_${Date.now()}`;
            const trimmedKey = key.trim();
            
            // If editing and key changed, remove old key
            const newExamples = { ...examplesAnalysis };
            if (editingExampleKey !== null && editingExampleKey !== trimmedKey) {
              delete newExamples[editingExampleKey];
            }
            
            // Add/update with new key
            newExamples[trimmedKey] = { ...example, name: trimmedKey };
            setExamplesAnalysis(newExamples);
          } else {
            // Handle legacy format (arrays)
            if (trainingDataDialogType === 'success') {
              if (editingTrainingDataIndex !== null) {
                const newExamples = [...exampleAnalyses];
                newExamples[editingTrainingDataIndex] = example;
                setExampleAnalyses(newExamples);
              } else {
                setExampleAnalyses([...exampleAnalyses, example]);
              }
            } else {
              if (editingTrainingDataIndex !== null) {
                const newExamples = [...exampleAnalysesFail];
                newExamples[editingTrainingDataIndex] = example;
                setExampleAnalysesFail(newExamples);
              } else {
                setExampleAnalysesFail([...exampleAnalysesFail, example]);
              }
            }
          }
        }}
        example={
          editingExampleKey !== null && examplesAnalysis[editingExampleKey]
            ? examplesAnalysis[editingExampleKey]
            : editingTrainingDataIndex !== null
            ? trainingDataDialogType === 'success'
              ? exampleAnalyses[editingTrainingDataIndex] || null
              : exampleAnalysesFail[editingTrainingDataIndex] || null
            : null
        }
        indicators={indicators}
        disabled={isLoading}
      />
    </Box>
  );
};

