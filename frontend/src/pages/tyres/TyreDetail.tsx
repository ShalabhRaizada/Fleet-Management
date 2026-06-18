import { useNavigate, useParams } from 'react-router-dom';
import { tyreApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { Tyre } from '../../types/entities';

export default function TyreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <CrudDetailPage<Tyre>
      title="Tyre Detail"
      basePath="/tyres"
      get={tyreApi.get}
      fieldsToShow={[
        { key: 'tyre_serial_no', label: 'Serial No' },
        { key: 'brand', label: 'Brand' },
        { key: 'model', label: 'Model' },
        { key: 'size', label: 'Size' },
        { key: 'current_vehicle_id', label: 'Current Vehicle ID' },
        { key: 'current_position', label: 'Current Position' },
        { key: 'status', label: 'Status' },
        { key: 'total_run_km', label: 'Total Run (km)' },
      ]}
      extra={() => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/tyres/${id}/fitment`)} className="text-sm px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded">
            Record Fitment
          </button>
          <button onClick={() => navigate(`/tyres/${id}/removal`)} className="text-sm px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded">
            Record Removal
          </button>
        </div>
      )}
    />
  );
}
