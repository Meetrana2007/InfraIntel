import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { Project, ProjectFilter, RiskWeights, RiskThresholds, EarlyWarningAlert } from '../types/paimana';
import { PAIMANA_APRIL_2026_PROJECTS } from '../data/paimanaApril2026';
import { DEFAULT_WEIGHTS, DEFAULT_THRESHOLDS, analyzeProjectRisk } from '../utils/riskEngine';
import { generateEarlyWarnings } from '../utils/earlyWarnings';
import { ApiService } from '../services/apiService';

interface ProjectContextType {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  selectedProject: Project | null;
  setSelectedProject: (p: Project | null) => void;
  openProjectDetails: (p: Project) => void;
  closeProjectDetails: () => void;
  isDetailModalOpen: boolean;
  filters: ProjectFilter;
  setFilters: React.Dispatch<React.SetStateAction<ProjectFilter>>;
  resetFilters: () => void;
  filteredProjects: Project[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  weights: RiskWeights;
  setWeights: React.Dispatch<React.SetStateAction<RiskWeights>>;
  thresholds: RiskThresholds;
  setThresholds: React.Dispatch<React.SetStateAction<RiskThresholds>>;
  resetWeightsAndThresholds: () => void;
  alerts: EarlyWarningAlert[];
  resetToDefaultDataset: () => void;
  loadCustomProjects: (data: Project[]) => void;
}

const defaultFilters: ProjectFilter = {
  state: 'All',
  ministry: 'All',
  sector: 'All',
  agency: 'All',
  riskCategory: 'All',
  minProgress: 0,
  maxProgress: 100,
  searchQuery: '',
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(PAIMANA_APRIL_2026_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(PAIMANA_APRIL_2026_PROJECTS[0]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<ProjectFilter>(defaultFilters);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [weights, setWeights] = useState<RiskWeights>(DEFAULT_WEIGHTS);
  const [thresholds, setThresholds] = useState<RiskThresholds>(DEFAULT_THRESHOLDS);

  // Sync with ApiService
  useEffect(() => {
    ApiService.setCustomProjects(projects);
  }, [projects]);

  useEffect(() => {
    ApiService.setRiskConfig(weights, thresholds);
  }, [weights, thresholds]);

  const openProjectDetails = (p: Project) => {
    setSelectedProject(p);
    setIsDetailModalOpen(true);
  };

  const closeProjectDetails = () => {
    setIsDetailModalOpen(false);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const resetWeightsAndThresholds = () => {
    setWeights(DEFAULT_WEIGHTS);
    setThresholds(DEFAULT_THRESHOLDS);
  };

  const resetToDefaultDataset = () => {
    setProjects(PAIMANA_APRIL_2026_PROJECTS);
    setSelectedProject(PAIMANA_APRIL_2026_PROJECTS[0]);
    resetFilters();
    resetWeightsAndThresholds();
  };

  const loadCustomProjects = (data: Project[]) => {
    if (Array.isArray(data) && data.length > 0) {
      setProjects(data);
      setSelectedProject(data[0]);
      resetFilters();
    }
  };

  // Filter projects dynamically
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // 1. Search Query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = p.projectName.toLowerCase().includes(query);
        const matchesCode = p.projectCode.toLowerCase().includes(query);
        const matchesAgency = p.agency.toLowerCase().includes(query);
        const matchesState = p.state.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesAgency && !matchesState) return false;
      }

      // 2. State
      if (filters.state !== 'All' && p.state !== filters.state) return false;

      // 3. Ministry
      if (filters.ministry !== 'All' && p.ministry !== filters.ministry) return false;

      // 4. Sector
      if (filters.sector !== 'All' && p.sector !== filters.sector) return false;

      // 5. Agency
      if (filters.agency !== 'All' && p.agency !== filters.agency) return false;

      // 6. Risk Level
      if (filters.riskCategory !== 'All') {
        const risk = analyzeProjectRisk(p, weights, thresholds);
        if (risk.category !== filters.riskCategory) return false;
      }

      // 7. Physical Progress range
      if (p.physicalProgress !== null) {
        if (p.physicalProgress < filters.minProgress || p.physicalProgress > filters.maxProgress) {
          return false;
        }
      }

      return true;
    });
  }, [projects, filters, weights, thresholds]);

  // Compute alerts dynamically
  const alerts = useMemo(() => {
    return generateEarlyWarnings(filteredProjects);
  }, [filteredProjects]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        setProjects,
        selectedProject,
        setSelectedProject,
        openProjectDetails,
        closeProjectDetails,
        isDetailModalOpen,
        filters,
        setFilters,
        resetFilters,
        filteredProjects,
        activeTab,
        setActiveTab,
        weights,
        setWeights,
        thresholds,
        setThresholds,
        resetWeightsAndThresholds,
        alerts,
        resetToDefaultDataset,
        loadCustomProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
