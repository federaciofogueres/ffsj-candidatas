import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { LabelsFormulario } from '../../model/candidata-data.model';
import { Asociacion } from '../../services/external-api/external-api';

@Component({
  selector: 'app-dialog-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './dialog-overview.component.html',
  styleUrl: './dialog-overview.component.scss'
})
export class DialogOverviewComponent implements OnInit {
  Object = Object;
  LabelsFormulario = LabelsFormulario;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    const datos = this.data?.datos;
    if (!datos) return;

    // Sólo operar si "datos" es un objeto (evita sobrescribir arrays/primitivos)
    if (typeof datos === 'object' && datos !== null) {
      // curriculum puede venir como JSON string en datos.curriculum.value
      if (datos['curriculum'] && typeof datos['curriculum'].value === 'string') {
        try {
          datos['curriculum'].value = JSON.parse(datos['curriculum'].value);
        } catch (e) {
          console.warn('No se pudo parsear curriculum:', e);
        }
      }

      // Resolver etiqueta de asociación si vienen asociaciones y existe campo asociacion
      if (datos['asociacion'] && Array.isArray(this.data?.asociaciones)) {
        const assocId = datos['asociacion'].value;
        const found = this.data.asociaciones.find((asociacion: Asociacion) => String(asociacion.id) === String(assocId));
        if (found) {
          datos['asociacion'].value = found.nombre;
        }
      }
    }
  }

  viewFile(url: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'document';
    link.target = '_blank';
    link.click();
  }

  downloadFile(url: string, label: string): void {
    const isLocalhost =
      location.hostname === 'localhost' || location.hostname === '127.0.0.1';

    if (!url || !url.includes('https://firebasestorage.googleapis.com')) {
      console.error('URL de descarga no válida:', url);
      return;
    }

    // ---------- Función común para construir el nombre final ----------
    const buildFinalFileName = (fullUrl: string): string => {
      // 1. Obtener el nombre real desde la URL (último segmento sin query)
      const lastPart = decodeURIComponent(
        fullUrl.split('/').pop()!.split('?')[0]
      );
      // ej: "79-SAN_BLAS_ALTO.pdf"

      const dotIndex = lastPart.lastIndexOf('.');
      const baseName = dotIndex >= 0 ? lastPart.substring(0, dotIndex) : lastPart;
      const ext = dotIndex >= 0 ? lastPart.substring(dotIndex) : '.pdf';

      // 2. Tomar todo el path a partir de /o/ y DECODIFICARLO
      //    ej bruto: "candidatas%2F2025%2Fadultas%2FautorizacionFoguera%2F79-SAN_BLAS_ALTO.pdf"
      const fullPathSegmentRaw = fullUrl.split('/o/')[1]?.split('?')[0] || '';
      const fullPathDecoded = decodeURIComponent(fullPathSegmentRaw);
      // ej: "candidatas/2025/adultas/autorizacionFoguera/79-SAN_BLAS_ALTO.pdf"

      // 3. Quitar extensión del path
      const fullPathWithoutExt = fullPathDecoded.replace(/\.[^/.]+$/, '');
      // "candidatas/2025/adultas/autorizacionFoguera/79-SAN_BLAS_ALTO"

      // 4. Slugificar el path
      const slugifyPath = (text: string): string =>
        text
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // quitar acentos
          .toLowerCase()
          .replace(/[\/_]+/g, '-') // "/" o "_" -> "-"
          .replace(/[^a-z0-9-]+/g, '-') // resto raro -> "-"
          .replace(/-+/g, '-') // colapsar guiones
          .replace(/^-+|-+$/g, ''); // quitar guiones extremos

      let assocSlug = slugifyPath(fullPathWithoutExt);
      // ej: "candidatas-2025-adultas-autorizacionfoguera-79-san-blas-alto"

      // 5. Limpiar prefijos y el id:
      assocSlug = assocSlug
        .replace(/^candidatas-\d{4}-(adultas|infantiles)-/, '') // quita "candidatas-2025-adultas-"
        .replace(/-\d+-/, '-') // quita "-79-"
        .replace(/-+/g, '-') // limpia dobles guiones
        .replace(/^-+|-+$/g, ''); // limpia guiones extremos

      // Resultado esperado: "autorizacionfoguera-san-blas-alto"

      return `${assocSlug || baseName}${ext}`;
    };

    const finalFileName = buildFinalFileName(url);

    // ---------- PRODUCCIÓN: usar URL directa de Firebase + header de descarga ----------
    if (!isLocalhost) {
      const u = new URL(url);

      // Firebase / GCS respeta este parámetro y envía:
      // Content-Disposition: attachment; filename="finalFileName"
      u.searchParams.set(
        'response-content-disposition',
        `attachment; filename="${finalFileName}"`
      );

      const downloadUrl = u.toString();
      window.location.href = downloadUrl;
      return;
    }

    // ---------- DESARROLLO: seguir usando /api + fetch + blob ----------
    const [, pathPart] = url.split('https://firebasestorage.googleapis.com');
    if (!pathPart) {
      console.error('No se pudo extraer la ruta de Firebase de la URL:', url);
      return;
    }

    const proxyUrl = `/api${pathPart}`;

    fetch(proxyUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const objectUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = finalFileName; // 👈 mismo nombre en dev
        link.click();
        window.URL.revokeObjectURL(objectUrl);
      })
      .catch(err => {
        console.error('Error descargando archivo a través del proxy:', err);
      });
  }

}
