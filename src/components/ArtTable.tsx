import { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";

type Artwork = {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
};

export default function ArtTable() {
  const ROWS_PER_PAGE = 10;

  const [page, setPage] = useState(1);
  const [data, setData] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Artwork[]>([]);
  const [globalSelectedIds, setglobalSelectedIds] = useState<Set<number>>(new Set());
  const op = useRef<OverlayPanel>(null);
  const [selectCount, setSelectCount] = useState<number>(0);

 useEffect(() => {
  const fetchArtworks = async () => {
    setLoading(true);

    const response = await fetch(
      `https://api.artic.edu/api/v1/artworks?page=${page}`
    );
    const json = await response.json();

    setData(json.data);
    setTotalRecords(json.pagination.total);

    const newSelectedRows: Artwork[] = [];
    const updatedglobalSelectedIds = new Set(globalSelectedIds);

    json.data.forEach((row: Artwork) => {
      if (updatedglobalSelectedIds.has(row.id)) {
        newSelectedRows.push(row);
      }
    });

    setSelectedRows(newSelectedRows);
    setLoading(false);
  };

  fetchArtworks();
}, [page]);


  const handleSelectionChange = (e: any) => {
    const currentPageSelections = e.value as Artwork[];
    const currentPageIds = new Set(currentPageSelections.map((row) => row.id));
    const updatedglobalSelectedIds = new Set(globalSelectedIds);

    currentPageSelections.forEach((row) => updatedglobalSelectedIds.add(row.id));

    data.forEach((row) => {
      if (!currentPageIds.has(row.id)) {
        updatedglobalSelectedIds.delete(row.id);
      }
    });

    setglobalSelectedIds(updatedglobalSelectedIds);
    setSelectedRows(currentPageSelections);
  };

  const handleSelectNRows = () => {
  if (!selectCount || selectCount <= 0) return;

  const rowsToSelect = data.slice(0, selectCount);
  const updatedSelectedIds = new Set(globalSelectedIds);
  rowsToSelect.forEach((row) => updatedSelectedIds.add(row.id));
  setglobalSelectedIds(updatedSelectedIds);
  setSelectedRows(rowsToSelect);

  op.current?.hide();
};


  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-xl p-6">

        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-2">
            <span className="text-gray-700 text-sm font-medium">
              Selected: {globalSelectedIds.size} rows
            </span>

            <Button
              icon="pi pi-chevron-down"
              className="p-button-text p-button-sm"
              onClick={(e) => op.current?.toggle(e)}
            />

            <OverlayPanel ref={op} className="shadow-lg">
              <div className="flex flex-col gap-3 w-64">
                <span className="font-semibold">Select Multiple Rows</span>
                <span className="text-sm text-gray-600">
                  Enter number of rows to select
                </span>

                <InputNumber
                  value={selectCount}
                  onValueChange={(e) => setSelectCount(e.value ?? 0)}
                  min={1}
                  max={totalRecords}
                />

                <Button label="Select" onClick={handleSelectNRows} />
              </div>
            </OverlayPanel>
          </div>

          <h1 className="text-xl font-semibold text-gray-800">
            Artwork Table
          </h1>
        </div>

        <DataTable
          value={data}
          paginator
          rows={ROWS_PER_PAGE}
          totalRecords={totalRecords}
          lazy
          loading={loading}
          first={(page - 1) * ROWS_PER_PAGE}
          onPage={(e) => setPage((e.page ?? 0) + 1)}
          selectionMode="multiple"
          selection={selectedRows}
          onSelectionChange={handleSelectionChange}
          dataKey="id"
          tableStyle={{ minWidth: "70rem" }}
        >
          <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
          <Column field="title" header="TITLE" />
          <Column field="place_of_origin" header="PLACE OF ORIGIN" />
          <Column field="artist_display" header="ARTIST" />
          <Column
            header="INSCRIPTIONS"
            body={(row: Artwork) => row.inscriptions || "N/A"}
          />
          <Column field="date_start" header="START DATE" />
          <Column field="date_end" header="END DATE" />
        </DataTable>
      </div>
    </div>
  );
}
