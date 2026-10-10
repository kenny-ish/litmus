import { getImageRegistry } from '@api/core/ImageRegistry';
import type { ImageRegistry } from '@db';
import { useAppStore } from './useAppStore';

// Default image registry configuration
const DEFAULT_IMAGE_REGISTRY = {
  name: 'docker.io',
  repo: 'litmuschaos',
  secret: ''
} as const;

export function useImageRegistry(): { imageRegistry: ImageRegistry | undefined; loading: boolean } {
  const { projectID } = useAppStore();
  
  // Fetch imageRegistry data
  const { data: getImageRegistryData, loading } = getImageRegistry({
    projectID: projectID ?? ''
  });

  const imageRegistryInfo = getImageRegistryData?.getImageRegistry?.imageRegistryInfo;

  // Create imageRegistry object with fallback values. The registry hostname is
  // only prefixed to the repo when it is set, so an empty hostname does not
  // produce a leading slash (e.g. "/team/chaos").
  const imageRegistry: ImageRegistry = imageRegistryInfo
    ? {
        repo: imageRegistryInfo.imageRegistryName
          ? `${imageRegistryInfo.imageRegistryName}/${imageRegistryInfo.imageRepoName}`
          : imageRegistryInfo.imageRepoName,
        secret: imageRegistryInfo.secretName
      }
    : DEFAULT_IMAGE_REGISTRY;

  return { imageRegistry, loading };
}
