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
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

    // función para sacar un nombre decente como antes
    const buildName = (fullUrl: string): string => {
      const lastPart = decodeURIComponent(fullUrl.split('/').pop()!.split('?')[0]);
      const dotIndex = lastPart.lastIndexOf('.');
      const baseName = dotIndex >= 0 ? lastPart.substring(0, dotIndex) : lastPart;

      const baseWithoutId = baseName.replace(/^\d+-/, ''); // quita "79-"
      const slug = baseWithoutId
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[_]+/g, ' ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      return slug || 'documento';
    };

    // ---------- PRODUCCIÓN: usar URL directa de Firebase ----------
    if (!isLocalhost) {
      const finalName = buildName(url) + '.pdf';

      const a = document.createElement('a');
      a.href = url;           // 👈 URL directa de Firebase
      a.target = '_blank';
      // algunos navegadores ignoran "download" en cross-origin, pero al menos el PDF será correcto
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }

    // ---------- DESARROLLO: seguir usando /api + fetch + blob ----------
    if (!url.includes('https://firebasestorage.googleapis.com')) {
      console.error('URL de descarga no válida:', url);
      return;
    }

    const [, pathPart] = url.split('https://firebasestorage.googleapis.com');
    if (!pathPart) {
      console.error('No se pudo extraer la ruta de Firebase de la URL:', url);
      return;
    }

    const proxyUrl = `/api${pathPart}`;

    // 2. Obtener el nombre de fichero real desde la URL de Firebase (sin query, decodificado)
    const lastPart = decodeURIComponent(
      url.split('/').pop()!.split('?')[0]
    );
    // ej: "25-DOCTOR_BERGEZ_-_CAROLINAS.pdf"

    // 3. Separar base y extensión
    const dotIndex = lastPart.lastIndexOf('.');
    const baseName = dotIndex >= 0 ? lastPart.substring(0, dotIndex) : lastPart;
    const ext = dotIndex >= 0 ? lastPart.substring(dotIndex) : '';

    // 4. Tomar todo el path a partir de /o/ y DECODIFICARLO
    //    ej bruto: "candidatas%2F2025%2Fadultas%2FautorizacionFoguera%2F25-DOCTOR_BERGEZ_-_CAROLINAS.pdf"
    const fullPathSegmentRaw = url.split('/o/')[1]?.split('?')[0] || '';
    const fullPathDecoded = decodeURIComponent(fullPathSegmentRaw);
    // ej decodificado: "candidatas/2025/adultas/autorizacionFoguera/25-DOCTOR_BERGEZ_-_CAROLINAS.pdf"

    // 5. Quitar extensión del path
    const fullPathWithoutExt = fullPathDecoded.replace(/\.[^/.]+$/, '');
    // "candidatas/2025/adultas/autorizacionFoguera/25-DOCTOR_BERGEZ_-_CAROLINAS"

    // 6. Función para slugificar textos (minúsculas, sin acentos, "/" y "_" a "-")
    const slugifyPath = (text: string): string =>
      text
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
        .toLowerCase()
        .replace(/[\/_]+/g, '-')        // "/" o "_" -> "-"
        .replace(/[^a-z0-9-]+/g, '-')   // resto raro -> "-"
        .replace(/-+/g, '-')            // colapsar guiones
        .replace(/^-+|-+$/g, '');       // quitar guiones extremos

    let assocSlug = slugifyPath(fullPathWithoutExt);
    // ej: "candidatas-2025-adultas-autorizacionfoguera-25-doctor-bergez-carolinas"

    // 7. Limpiar lo que sobra:
    //    - "candidatas-2025-adultas-" o "candidatas-2025-infantiles-"
    //    - el "-25-" (id) de en medio
    assocSlug = assocSlug
      .replace(/^candidatas-\d{4}-(adultas|infantiles)-/, '') // quita "candidatas-2025-adultas-"
      .replace(/-\d+-/, '-')                                  // quita "-25-"
      .replace(/-+/g, '-')                                    // limpia dobles guiones
      .replace(/^-+|-+$/g, '');                               // limpia guiones extremos

    // Resultado esperado: "autorizacionfoguera-doctor-bergez-carolinas"

    // 8. Nombre final (slug limpio + extensión original)
    const finalFileName = `${assocSlug || baseName}${ext}`;

    // 9. Descargar vía proxy como Blob (sin visor, como en tu versión que funcionaba)
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
        link.download = finalFileName;
        link.click();
        window.URL.revokeObjectURL(objectUrl);
      })
      .catch(err => {
        console.error('Error descargando archivo a través del proxy:', err);
      });
  }




}
