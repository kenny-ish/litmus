import { renderHook } from '@testing-library/react-hooks';
import { getImageRegistry } from '@api/core/ImageRegistry';
import { GetImageRegistryResponse, ImageRegistryType } from '@api/entities';
import { useImageRegistry } from '../useImageRegistry';

jest.mock('@api/core/ImageRegistry', () => ({
  getImageRegistry: jest.fn()
}));

const mockedGetImageRegistry = getImageRegistry as jest.MockedFunction<typeof getImageRegistry>;

type RegistryInfo = GetImageRegistryResponse['getImageRegistry']['imageRegistryInfo'];

function mockImageRegistry(info: Pick<RegistryInfo, 'imageRegistryName' | 'imageRepoName' | 'secretName'>): void {
  const data: GetImageRegistryResponse = {
    getImageRegistry: {
      imageRegistryID: 'registry-id',
      projectID: 'project-id',
      updatedAt: '',
      createdAt: '',
      isRemoved: false,
      imageRegistryInfo: {
        isDefault: false,
        imageRegistryType: ImageRegistryType.PRIVATE,
        secretNamespace: 'litmus',
        enableRegistry: true,
        ...info
      }
    }
  };

  mockedGetImageRegistry.mockReturnValue({ data, loading: false } as unknown as ReturnType<typeof getImageRegistry>);
}

describe('useImageRegistry', () => {
  beforeEach(() => {
    mockedGetImageRegistry.mockReset();
  });

  test('prefixes the repo with the registry hostname when it is set', () => {
    mockImageRegistry({ imageRegistryName: 'registry.example.com', imageRepoName: 'team/chaos', secretName: 'pull' });

    const { result } = renderHook(() => useImageRegistry());

    expect(result.current.loading).toBe(false);
    expect(result.current.imageRegistry).toEqual({ repo: 'registry.example.com/team/chaos', secret: 'pull' });
  });

  test('uses only the repo when the registry hostname is empty', () => {
    mockImageRegistry({ imageRegistryName: '', imageRepoName: 'team/chaos', secretName: '' });

    const { result } = renderHook(() => useImageRegistry());

    expect(result.current.imageRegistry).toEqual({ repo: 'team/chaos', secret: '' });
  });

  test('falls back to the default registry when no registry is returned', () => {
    mockedGetImageRegistry.mockReturnValue({ data: undefined, loading: true } as unknown as ReturnType<
      typeof getImageRegistry
    >);

    const { result } = renderHook(() => useImageRegistry());

    expect(result.current.loading).toBe(true);
    expect(result.current.imageRegistry).toMatchObject({ repo: 'litmuschaos', secret: '' });
  });
});
